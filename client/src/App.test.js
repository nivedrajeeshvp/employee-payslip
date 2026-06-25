import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

test('creates an employee and generates a payslip with leave-based salary', () => {
  render(<App />);

  fireEvent.change(screen.getByLabelText(/employee name/i), { target: { value: 'Asha Rao' } });
  fireEvent.change(screen.getByLabelText(/employee id/i), { target: { value: 'EMP1001' } });
  fireEvent.change(screen.getByLabelText(/designation/i), { target: { value: 'Developer' } });
  fireEvent.change(screen.getByLabelText(/joining date/i), { target: { value: '2024-01-10' } });
  fireEvent.change(screen.getByLabelText(/basic salary/i), { target: { value: '30000' } });
  fireEvent.change(screen.getByLabelText(/hra %/i), { target: { value: '20' } });
  fireEvent.change(screen.getByLabelText(/da %/i), { target: { value: '10' } });
  fireEvent.change(screen.getByLabelText(/other allowances %/i), { target: { value: '5' } });
  fireEvent.change(screen.getByLabelText(/esi %/i), { target: { value: '2' } });
  fireEvent.change(screen.getByLabelText(/pf %/i), { target: { value: '12' } });

  fireEvent.click(screen.getByRole('button', { name: /save employee/i }));

  expect(screen.getByText('Asha Rao')).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText(/employee selection/i), { target: { value: 'EMP1001' } });
  fireEvent.change(screen.getByLabelText(/leave count/i), { target: { value: '3' } });
  fireEvent.click(screen.getByRole('button', { name: /generate payslip/i }));

  expect(screen.getByText(/net salary/i)).toBeInTheDocument();
  expect(screen.getByText(/₹32,670\.00/i)).toBeInTheDocument();
});

test('edits an existing employee and updates the saved record', () => {
  render(<App />);

  fireEvent.click(screen.getAllByRole('button', { name: /edit/i })[0]);
  fireEvent.change(screen.getByLabelText(/employee name/i), { target: { value: 'Asha R. Rao' } });
  fireEvent.click(screen.getByRole('button', { name: /update employee/i }));

  expect(screen.getByText('Asha R. Rao')).toBeInTheDocument();
});

test('shows a button to download the payslip as a PDF', () => {
  render(<App />);

  fireEvent.change(screen.getByLabelText(/employee selection/i), { target: { value: 'EMP1001' } });
  fireEvent.change(screen.getByLabelText(/leave count/i), { target: { value: '3' } });
  fireEvent.click(screen.getByRole('button', { name: /generate payslip/i }));

  expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument();
});
