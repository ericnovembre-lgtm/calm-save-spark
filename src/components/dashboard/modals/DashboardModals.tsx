import { AddToGoalModal } from './AddToGoalModal';
import { PayBillModal } from './PayBillModal';
import { DebtPaymentModal } from './DebtPaymentModal';
import { CreditTipsModal } from './CreditTipsModal';

interface DashboardModalsProps {
  activeModal: string | null;
  onClose: () => void;
}

export function DashboardModals({ activeModal, onClose }: DashboardModalsProps) {
  return (
    <>
      <AddToGoalModal isOpen={activeModal === 'add_to_goal'} onClose={onClose} />
      <PayBillModal isOpen={activeModal === 'pay_bill'} onClose={onClose} />
      <DebtPaymentModal isOpen={activeModal === 'debt_payment'} onClose={onClose} />
      <CreditTipsModal isOpen={activeModal === 'credit_tips'} onClose={onClose} />
    </>
  );
}
