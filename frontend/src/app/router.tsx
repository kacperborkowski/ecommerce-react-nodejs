import { createBrowserRouter } from 'react-router'
import { CartPage } from '@/pages/CartPage'
import { CheckoutPage } from '@/pages/CheckoutPage'
import { HomePage } from '@/pages/HomePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { OrderConfirmationPage } from '@/pages/OrderConfirmationPage'
import { ProductPage } from '@/pages/ProductPage'
import { SearchPage } from '@/pages/SearchPage'
import { RootLayout } from './RootLayout'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/search', element: <SearchPage /> },
      { path: '/product/:slug', element: <ProductPage /> },
      { path: '/cart', element: <CartPage /> },
      { path: '/checkout', element: <CheckoutPage /> },
      { path: '/order/:id', element: <OrderConfirmationPage /> },
      // Any other address
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
