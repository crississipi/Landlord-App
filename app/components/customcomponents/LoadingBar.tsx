import { BarProps } from '@/types'
import React from 'react'

const LoadingBar = ({ size, rounded }: BarProps) => {
  return (
    <div className={`${size} ${rounded ? rounded : 'rounded-sm'} bg-gray-800/20`}></div>
  )
}

export default LoadingBar
