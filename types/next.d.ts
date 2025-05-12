import { NextPage } from 'next'
import { ReactElement, ReactNode } from 'react'

declare module 'next' {
  export type PageProps = {
    params?: any;
    searchParams?: Record<string, string | string[] | undefined>;
  }

  export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
    getLayout?: (page: ReactElement) => ReactNode
  }
}
