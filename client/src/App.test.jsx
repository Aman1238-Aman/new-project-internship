// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { BrowserRouter, useLocation } from 'react-router-dom';
import App, { Badge, EmployeeForm, Skeleton, TaskDetail } from './App.jsx';
import { api } from './lib/api.js';

vi.mock('./lib/api.js',()=>({api:{get:vi.fn(),post:vi.fn(),put:vi.fn(),delete:vi.fn()}}));
const dashboard={employees:{total:0,active:0,inactive:0,onLeave:0},tasks:{total:0,todo:0,inProgress:0,completed:0,cancelled:0,overdue:0},workload:[]};
const task={_id:'507f1f77bcf86cd799439011',taskId:'TSK-001',title:'Plan the launch',description:'',assignedEmployee:'507f191e810c19729de860ea',employeeSnapshot:{employeeId:'EMP-01',fullName:'Alex Morgan',department:'Design',role:'Designer'},department:'Design',priority:'High',status:'Todo',startDate:'2026-11-01T00:00:00.000Z',dueDate:'2026-11-30T00:00:00.000Z',createdDate:'2026-11-01T00:00:00.000Z',isOverdue:false};
function Location(){const l=useLocation();return <output data-testid="current-url">{l.pathname+l.search}</output>}
function mountApp(){return render(<BrowserRouter><App/><Location/></BrowserRouter>)}
beforeEach(()=>{vi.clearAllMocks();window.history.replaceState({},'', '/');});
afterEach(()=>cleanup());

describe('frontend shared states and controls',()=>{
 it('renders loading skeletons and status badges',()=>{render(<><Skeleton rows={2}/><Badge value="In Progress"/></>);expect(document.querySelectorAll('.skeleton-row')).toHaveLength(2);expect(screen.getByText('In Progress')).toHaveClass('in-progress');});

 it('marks the required employee fields for browser validation',()=>{render(<BrowserRouter><EmployeeForm setNotice={vi.fn()} refresh={vi.fn()}/></BrowserRouter>);expect(document.querySelectorAll('form input[required]').length).toBeGreaterThanOrEqual(5);expect(document.querySelector('form select[required]')).toBeInTheDocument();});

 it('preserves URL filters on refresh and when another filter changes',async()=>{
  window.history.replaceState({},'','/tasks?status=In%20Progress&priority=High&page=2');
  api.get.mockImplementation(path=>path==='/dashboard'?Promise.resolve({data:{data:dashboard}}):Promise.resolve({data:{data:{items:[],pagination:{page:2,limit:10,total:0,totalPages:1}}}}));
  mountApp();
  await waitFor(()=>{const url=new URL(screen.getByTestId('current-url').textContent,'http://localhost');expect(url.searchParams.get('status')).toBe('In Progress');expect(url.searchParams.get('priority')).toBe('High');expect(url.searchParams.get('page')).toBe('2');});
  const dept=screen.getByDisplayValue('All departments');fireEvent.change(dept,{target:{value:'Design'}});
  await waitFor(()=>{const url=new URL(screen.getByTestId('current-url').textContent,'http://localhost');expect(url.searchParams.get('status')).toBe('In Progress');expect(url.searchParams.get('priority')).toBe('High');expect(url.searchParams.get('page')).toBe('1');expect(url.searchParams.get('department')).toBe('Design');});
 });

 it('shows only the valid next task statuses',async()=>{
  api.get.mockResolvedValue({data:{data:task}});
  render(<BrowserRouter><TaskDetail setNotice={vi.fn()} refresh={vi.fn()}/></BrowserRouter>);
  const select=await screen.findByDisplayValue('Choose next status');
  expect([...select.options].map(o=>o.value)).toEqual(['','In Progress','Cancelled']);
 });

 it('shows backend errors as a notification on list failures',async()=>{
  api.get.mockImplementation(path=>path==='/dashboard'?Promise.resolve({data:{data:dashboard}}):Promise.reject('API is unavailable'));
  window.history.replaceState({},'','/tasks');mountApp();
  expect(await screen.findByText('API is unavailable')).toBeInTheDocument();
 });
});
