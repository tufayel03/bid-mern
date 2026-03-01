import React from 'react';
import { AuctionModal } from './AuctionModal';
import { ProductModal } from './ProductModal';
import { OrderModal } from './OrderModal';
import { UserModal } from './UserModal';
import { MiscModals } from './MiscModals';

export function AdminModals() {
    return (
        <>
            <AuctionModal />
            <ProductModal />
            <OrderModal />
            <UserModal />
            <MiscModals />
        </>
    );
}
