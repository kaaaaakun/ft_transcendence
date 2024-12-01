import { Banner } from '@/js/components/ui/Banner'
import { Teact } from '@/js/libs/teact'

export const useBanner = () => {
  const [banners, setBanners] = Teact.useState([])

  const handleClose = (index) => {
    setBanners(prevBanners => prevBanners.filter((_, i) => i !== index))
  }

  const showInfoBanner = ({ message, onClose }) => {
    setBanners([
      ...banners,
      Teact.createElement(Banner, {
        type: 'info',
        message,
        onClose: () => {
          onClose()
          handleClose(banners.length)
        }
      }),
    ])
  }

  const showWarningBanner = ({ message, onClose }) => {
    setBanners([
      ...banners,
      Teact.createElement(Banner, {
        type: 'warning',
        message,
        onClose: () => {
          onClose()
          handleClose(banners.length)
        }
      }),
    ])
  }

  const showErrorBanner = ({ message, onClose }) => {
    setBanners([
      ...banners,
      Teact.createElement(Banner, {
        type: 'error',
        message,
        onClose: () => {
          onClose()
          handleClose(banners.length)
        }
      }),
    ])
  }

  return {
    banners,
    showInfoBanner,
    showWarningBanner,
    showErrorBanner,
  }
}