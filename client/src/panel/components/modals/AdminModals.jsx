import { AuctionModal } from './AuctionModal';
import { OrderModal } from './OrderModal';
import { UserModal } from './UserModal';
import { MiscModals } from './MiscModals';

export function AdminModals() {
    return (
        <>
            <AuctionModal />
            <OrderModal />
            <UserModal />
            <MiscModals />
        </>
    );
}
