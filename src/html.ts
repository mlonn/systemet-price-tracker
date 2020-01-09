import { IArticle } from "./types";

export const pre = `
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tbody>
        <tr>
          <td
            align="center"
            style="background-color: #ffffff;"
            bgcolor="#EEEEEE"
          >
            <table
              align="center"
              border="0"
              cellpadding="0"
              cellspacing="0"
              width="100%"
              style="max-width:800px;"
            >
              <tbody>
                <tr>
                  <td
                    align="left"
                    style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 400; line-height: 20px;"
                  >
                    <p
                      style="font-size: 15px; font-weight: 400; margin: 0;line-height: 20px; color: #444444;"
                    >
                      Todays price changes at Systembolaget
                    </p>
                  </td>
                </tr>
                <tr>
                  <td
                    align="left"
                    style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 400; line-height: 20px; padding: 4px 2px;"
                  >
                    <table
                      cellspacing="0"
                      cellpadding="0"
                      border="0"
                      width="100%"
                      style="border-bottom: 1px solid #dedede;"
                    >
                      <tbody>
                        <tr>
                          <td>
                            <span style="font-weight: 800;">Name</span>
                          </td>
                          <td width="20%">
                            <span
                              style="font-weight: 800;min-width: 54px;display: inline-block;"
                              >Old price</span
                            >
                          </td>
                          <td width="20%">
                            <span
                              style="font-weight: 800;min-width: 54px;display: inline-block;"
                              >New price</span
                            >
                          </td>
                          <td width="20%">
                            <span
                              style="font-weight: 800;min-width: 54px;display: inline-block;"
                              >Size</span
                            >
                          </td>
                          <td width="20%">
                            <span
                              style="font-weight: 800;min-width: 54px;display: inline-block;"
                              >Type</span
                            >
                          </td>
                        </tr>
`;

export const row = (old: IArticle, update: IArticle) => `<tr>
<td>
  <a
    href="https://systembolaget.se/${update.nr}"
    style="color: black;display:block;text-decoration: none;font-size:13px;"
    rel="nofollow"
  >
    <span style="font-weight: 800;"
      >${update.Namn}</span
    >
    <br />
    <span style="font-size: 12px;"
      >${update.Producent}</span
    >
  </a>
</td>
<td
  width="20%"
  align="left"
  style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 400; line-height: 20px; padding: 4px 2px;"
>
  <a
    href="https://systembolaget.se/${update.nr}"
    style="color: black;display:block;text-decoration: none;font-size:12px;"
    rel="nofollow"
  >
    <span
      style="min-width: 54px;display: inline-block;"
      >${
        parseFloat(old.Prisinklmoms) % 1 === 0
          ? Math.round(parseFloat(old.Prisinklmoms))
          : parseInt(old.Prisinklmoms)
      } kr</span
    >
  </a>
</td>
<td
  width="20%"
  align="left"
  style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 400; line-height: 20px; padding: 4px 2px;"
>
  <a
    href="https://systembolaget.se/${update.nr}"
    style="color: black;display:block;text-decoration: none;font-size:12px;"
    rel="nofollow"
  >
    <span
      style="min-width: 54px;display: inline-block;"
      >${
        parseFloat(update.Prisinklmoms) % 1 === 0
          ? Math.round(parseFloat(update.Prisinklmoms))
          : parseInt(update.Prisinklmoms)
      } kr</span
    >
  </a>
</td>
<td
  width="20%"
  align="left"
  style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 400; line-height: 20px; padding: 4px 2px;"
>
  <a
    href="https://systembolaget.se/${update.nr}"
    style="color: black;display:block;text-decoration: none;font-size:12px;"
    rel="nofollow"
  >
    <span
      style="min-width: 54px;display: inline-block;"
      >${Math.round(parseFloat(update.Volymiml))} ml</span
    >
  </a>
</td>
<td
  width="20%"
  align="left"
  style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 400; line-height: 20px; padding: 4px 2px;"
>
  <a
    href="https://systembolaget.se/${update.nr}"
    style="color: black;display:block;text-decoration: none;font-size:12px;"
    rel="nofollow"
  >
    <span
      style="min-width: 54px;display: inline-block;"
      >${update.Typ}</span
    >
  </a>
</td>
</tr>`;

export const post = `
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
`;
