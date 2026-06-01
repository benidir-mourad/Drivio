import api from '../api/client'

export async function downloadPdf(url: string, filename: string): Promise<void> {
  const res = await api.get(url, { responseType: 'blob' })
  const blobUrl = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(blobUrl)
}
