import { AddToGoalModal } from './AddToGoalModal';
import { PayBillModal } from './PayBillModal';
import { DebtPaymentModal } from './DebtPaymentModal';
import { CreditTipsModal } from './CreditTipsModal';

interface DashboardModalsProps {
  activeModal: string | null;
  onClose: () => void;
  onOpenModal: (modalId: string) => void;
}

export function DashboardModals({ activeModal, onClose, onOpenModal }: DashboardModalsProps) {
  return (
    <>
      <AddToGoalModal 
        isOpen={activeModal === 'add_to_goal'} 
        onClose={onClose} 
        onOpen={() => onOpenModal('add_to_goal')}
      />
      <PayBillModal 
        isOpen={activeModal === 'pay_bill'} 
        onClose={onClose}
        onOpen={() => onOpenModal('pay_bill')}
      />
      <DebtPaymentModal 
        isOpen={activeModal === 'debt_payment'} 
        onClose={onClose}
        onOpen={() => onOpenModal('debt_payment')}
      />
      <CreditTipsModal isOpen={activeModal === 'credit_tips'} onClose={onClose} />
    </>
  );
}
