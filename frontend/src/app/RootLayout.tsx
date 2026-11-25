import { Outlet } from 'react-router'
import { CartLink } from '@/modules/cart'
import { Header } from '@/modules/layout'

export function RootLayout() {
  return (
    <>
      <Header actions={<CartLink />} />
      <main>
        <Outlet />
      </main>
    </>
  )
}
