**Page Table Enhancer** is a TamperMonkey script that adjusts the appearance of Distributed Proofreaders page detail tables as follow:
* Allows round columns to be hidden: P1 through F2. The setting is remembered until changed using a cookie.
* By default, makes substantial adjustments to the style of the table. Round columns are differentially colored by round. There is a checkbox to turn this off.
* Simplifies many textual elements of a large, overly busy table in various ways, to reduce table width and legibility:
  * Changing "xx_page.saved" to "saved"
  * Changing "no diff" to a one-character symbol
  * removing *.png" from the filename
  * usernames will not break over a line; along with moving *(page count)* to "detail" mode, these allow row heights to be consistent
  * removes "20" from "2026" and moves the *time* into detail mode
* Ajusts the URL of F1 diffs so that formatting comparison is already on. (!!)
* Etc.
