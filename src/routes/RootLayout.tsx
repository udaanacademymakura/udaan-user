import { Outlet } from 'react-router-dom';
import ChatDialogLauncher from '../components/organism/ChatDialogLauncher';
import LiveClassGate from '../components/organism/LiveClassGate';
import ResponsiveDrawer from '../components/pages/layout/sidebar';
import TicketChatPanel from '../components/pages/TicketManagement/allTickets/TicketChatPanel';

export default function RootLayout() {
    return (
        <div className='udaan__root'>
            <ResponsiveDrawer >
                <LiveClassGate>
                    <Outlet />
                </LiveClassGate>
                <ChatDialogLauncher>
                    <TicketChatPanel isModal />
                </ChatDialogLauncher>
            </ResponsiveDrawer>
        </div>
    )
}
