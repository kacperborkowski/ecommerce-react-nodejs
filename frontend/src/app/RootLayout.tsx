import { Outlet } from 'react-router'
import { Header } from '@/modules/layout'

export function RootLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  )
}
