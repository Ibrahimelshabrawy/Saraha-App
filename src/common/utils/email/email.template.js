export const emailTemplate = ({otp, subject}) => {
  return `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>OTP Verification</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
    "
  >
    <table align="center" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table
            width="500"
            cellpadding="0"
            cellspacing="0"
            style="
              background: #ffffff;
              margin-top: 40px;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            "
          >
            <!-- Header -->
            <tr>
              <td
                align="center"
                style="
                  background: #0f172a;
                  padding: 20px;
                  color: #ffffff;
                  font-size: 24px;
                "
              >
                ${subject}
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 30px; text-align: center; color: #333">
                <h2>Hello Our Client 👋</h2>

                <p style="font-size: 16px">
                  Use the following OTP to ${subject}:
                </p>

                <!-- OTP BOX -->
                <div
                  style="
                    display: inline-block;
                    background: #0f172a;
                    color: #ffffff;
                    font-size: 32px;
                    letter-spacing: 6px;
                    padding: 15px 30px;
                    border-radius: 8px;
                    margin: 20px 0;
                  "
                >
                  ${otp}
                </div>

                <p style="font-size: 14px; color: #999">
                  If you didn't request this email, please ignore it.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                align="center"
                style="
                  background: #f1f1f1;
                  padding: 15px;
                  font-size: 12px;
                  color: #888;
                "
              >
                © 2026 Saraha App. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
};
