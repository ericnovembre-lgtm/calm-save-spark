export const mockKYCDocument = {
  id: 'kyc-1',
  user_id: 'user-1',
  document_type: 'drivers_license',
  document_storage_path: 'kyc-documents/user-1/license.jpg',
  document_number: 'DL123456',
  status: 'verified' as const,
  extracted_data: {
    name: 'John Doe',
    date_of_birth: '1990-01-01',
    address: '123 Main St',
    document_number: 'DL123456',
  },
  verified_at: '2024-01-15T10:00:00Z',
  created_at: '2024-01-15T09:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
};

export const mockTaxDocument = {
  id: 'tax-1',
  user_id: 'user-1',
  tax_year: 2024,
  document_name: 'w2-2024.pdf',
  document_type: 'w2',
  storage_path: 'user-1/2024/w2-2024.pdf',
  processing_status: 'completed' as const,
  parsed_data: {
    document_type: 'w2',
    tax_year: 2024,
    payer_name: 'Acme Corp',
    payer_ein: '12-3456789',
    amounts: {
      wages: 75000,
      federal_tax: 12000,
      social_security_wages: 75000,
      medicare_wages: 75000,
    },
  },
  created_at: '2024-01-15T09:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
};

export const mockTaxReceipt = {
  id: 'receipt-1',
  user_id: 'user-1',
  tax_year: 2024,
  document_name: 'office-supplies.jpg',
  document_type: 'receipt',
  storage_path: 'user-1/2024/receipt-1.jpg',
  processing_status: 'completed' as const,
  parsed_data: {
    document_type: 'receipt',
    merchant: 'Office Depot',
    date: '2024-03-15',
    amount: 156.78,
    category: 'office_supplies',
    tax_deductible: true,
  },
  created_at: '2024-03-16T09:00:00Z',
  updated_at: '2024-03-16T09:30:00Z',
};

export const mockLifePlan = {
  id: 'plan-1',
  user_id: 'user-1',
  title: 'My Dream Wedding',
  event_type: 'wedding',
  target_date: '2025-06-15',
  total_estimated_cost: 30000,
  current_saved_amount: 8000,
  monthly_savings_target: 1500,
  status: 'planning' as const,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
};

export const mockLifeEventScenario = {
  id: 'scenario-1',
  life_plan_id: 'plan-1',
  scenario_name: 'Budget Wedding',
  description: 'Cost-effective wedding with 50 guests',
  is_selected: true,
  projected_outcomes: {
    total_cost: 25000,
    monthly_savings_needed: 1250,
    timeline_months: 18,
    pros_cons: {
      pros: ['More affordable', 'Less stress', 'Intimate gathering'],
      cons: ['Smaller guest list', 'Fewer vendor options'],
    },
  },
  created_at: '2024-01-01T00:00:00Z',
};

export const mockLifeEventCost = {
  id: 'cost-1',
  life_plan_id: 'plan-1',
  cost_name: 'Venue Rental',
  cost_category: 'venue',
  cost_type: 'one_time',
  estimated_amount: 5000,
  actual_amount: null,
  is_paid: false,
  due_date: '2025-05-01',
  created_at: '2024-01-01T00:00:00Z',
};

export const mockLifeEventChecklist = {
  id: 'checklist-1',
  life_plan_id: 'plan-1',
  title: 'Book venue',
  description: 'Research and book wedding venue',
  item_type: 'task',
  category: 'venue',
  priority: 'high' as const,
  is_completed: false,
  due_date: '2024-12-01',
  reminder_date: '2024-11-15',
  created_at: '2024-01-01T00:00:00Z',
};

export const mockKYCVerification = {
  id: 'verification-1',
  user_id: 'user-1',
  status: 'verified' as const,
  document_type: 'drivers_license',
  document_number: 'DL123456',
  document_storage_path: 'kyc-documents/user-1/license.jpg',
  verification_provider: 'lovable_ai',
  verified_at: '2024-01-15T10:00:00Z',
  attempts: 1,
  created_at: '2024-01-15T09:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
};

// Factory functions for creating test data with overrides
export const createMockKYCDocument = (overrides?: Partial<typeof mockKYCDocument>) => ({
  ...mockKYCDocument,
  ...overrides,
});

export const createMockTaxDocument = (overrides?: Partial<typeof mockTaxDocument>) => ({
  ...mockTaxDocument,
  ...overrides,
});

export const createMockLifePlan = (overrides?: Partial<typeof mockLifePlan>) => ({
  ...mockLifePlan,
  ...overrides,
});

export const createMockLifeEventScenario = (overrides?: Partial<typeof mockLifeEventScenario>) => ({
  ...mockLifeEventScenario,
  ...overrides,
});
