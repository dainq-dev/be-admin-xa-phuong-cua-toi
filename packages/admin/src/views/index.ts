/**
 * View exports - Lazy loaded for optimal code splitting
 */
import { lazy } from 'react'

// Lazy-loaded views for better performance
export const TrangChu = lazy(() => import('./trang-chu'))
export const TinTuc = lazy(() => import('./tin-tuc'))
export const TinTucEditor = lazy(() => import('./tin-tuc/editor'))
export const TaiLieu = lazy(() => import('./tai-lieu'))
export const GopY = lazy(() => import('./gop-y'))
export const NguoiDung = lazy(() => import('./nguoi-dung'))
export const CaiDat = lazy(() => import('./cai-dat'))
export const DangNhap = lazy(() => import('./dang-nhap'))
export const KhongTimThayTrang = lazy(() => import('./khong-tim-thay-trang'))
