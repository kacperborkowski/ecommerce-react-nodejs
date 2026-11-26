import { Outlet } from 'react-router'
import { AccountMenu } from '@/modules/auth'
import { CartLink } from '@/modules/cart'
import { Header } from '@/modules/layout'

export function RootLayout() {
  return (
    <>
      <Header
        actions={
          <>
            <AccountMenu />
            <CartLink />
          </>
        }
      />
      <main>
        <Outlet />
      </main>
    </>
  )
}
