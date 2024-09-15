import QrCode from "qrcode"
import path from "path"
import { fileURLToPath } from "url"

export const generateQr = async (text) => {
  // this is the __dirname equivalent in commonjs module.
  const __dirname = path.dirname(fileURLToPath(import.meta.url))

  try {
    const randomId = crypto.randomUUID()

    const fileNameAndPath = path.join(__dirname, `../../public/qr-codes/${randomId}.png`)

    const generatedQr = await QrCode.toFile(fileNameAndPath, text)

    return fileNameAndPath
  } catch (error) {
    throw new Error("error generating qrcode")
  }
}
