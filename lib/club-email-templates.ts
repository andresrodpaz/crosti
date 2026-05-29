export function generateClubWelcomeEmailHTML(name: string, stampCount: number, rewardDescription: string): string {
  const burgundy = "#930021"
  const cream = "#F8E19A" 
  const bgMain = "#FEFCF5"
  
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: ${bgMain}; color: #1f2937;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    <tr>
      <td style="background-color: ${burgundy}; padding: 32px 20px; text-align: center;">
        <h1 style="color: ${cream}; margin: 0; font-size: 28px; font-weight: 700;">Club Crosti</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 24px; text-align: center;">
        <h2 style="color: #111827; margin: 0 0 16px 0;">¡Bienvenido/a al Club${name ? `, ${name}` : ''}! 🍪</h2>
        <p style="color: #6b7280; font-size: 16px; line-height: 1.5;">Gracias por unirte. Ya tienes tu tarjeta digital lista.</p>
        ${stampCount > 0 ? `<p style="color: #6b7280; font-size: 16px;">Como regalo de bienvenida, ya te hemos añadido <strong>${stampCount} sello(s)</strong>.</p>` : ''}
        <p style="color: #6b7280; font-size: 16px;">Reúne sellos con cada compra y consigue: <strong>${rewardDescription}</strong>.</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 24px 40px 24px; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/club" style="display: inline-block; background-color: ${burgundy}; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Añadir a mi Wallet</a>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

export function generateStampNotificationEmailHTML(stampsGiven: number, currentStamps: number, totalStamps: number): string {
  const burgundy = "#930021"
  const bgMain = "#FEFCF5"
  
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: ${bgMain}; color: #1f2937;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    <tr>
      <td style="background-color: ${burgundy}; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">¡Nuevos sellos conseguidos!</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 24px; text-align: center;">
        <h2 style="color: #111827; margin: 0 0 16px 0;">+${stampsGiven} Sello${stampsGiven > 1 ? 's' : ''}</h2>
        <p style="color: #6b7280; font-size: 16px;">Acabamos de sumar ${stampsGiven} sello${stampsGiven > 1 ? 's' : ''} a tu tarjeta del Club Crosti.</p>
        <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin-top: 24px;">
          <p style="margin: 0; font-size: 18px; font-weight: bold;">Llevas ${currentStamps} de ${totalStamps} sellos</p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

export function generateRewardUnlockedEmailHTML(rewardDescription: string): string {
  const burgundy = "#930021"
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FEFCF5; color: #1f2937;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
    <tr>
      <td style="background-color: #059669; padding: 32px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">¡Premio Desbloqueado! 🎉</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 24px; text-align: center;">
        <p style="color: #6b7280; font-size: 18px; line-height: 1.5;">¡Enhorabuena! Has completado tu tarjeta de sellos del Club Crosti.</p>
        <h2 style="color: ${burgundy}; margin: 24px 0; font-size: 24px;">Ya puedes pedir: ${rewardDescription}</h2>
        <p style="color: #6b7280; font-size: 16px;">Solo tienes que venir a la tienda y enseñar tu tarjeta para canjearlo.</p>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

export function generateBirthdayEmailHTML(name: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FEFCF5; color: #1f2937;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
    <tr>
      <td style="background-color: #f59e0b; padding: 32px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">¡Feliz Cumpleaños! 🎂</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 24px; text-align: center;">
        <h2 style="color: #111827; margin: 0 0 16px 0;">¡Felicidades${name ? ` ${name}` : ''}!</h2>
        <p style="color: #6b7280; font-size: 16px;">En Crosti queremos celebrarlo contigo. Te hemos regalado <strong>1 sello extra</strong> en tu tarjeta.</p>
        <p style="color: #6b7280; font-size: 16px;">Pásate a vernos y date un capricho. ¡Que pases un día genial!</p>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

export function generateWinBackEmailHTML(): string {
  const burgundy = "#930021"
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FEFCF5; color: #1f2937;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
    <tr>
      <td style="background-color: ${burgundy}; padding: 32px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Te echamos de menos 🍪</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 24px; text-align: center;">
        <p style="color: #6b7280; font-size: 18px; line-height: 1.5;">Hace tiempo que no te vemos por Crosti.</p>
        <p style="color: #6b7280; font-size: 16px;">Tus sellos te están esperando. ¡Ven a vernos pronto!</p>
      </td>
    </tr>
  </table>
</body>
</html>
`
}
