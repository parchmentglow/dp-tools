**1. Flex layout from plaintext TOC** is a [self-contained HTML file](https://parchmentglow.github.io/dp-tools/Flex%20layout%20from%20plaintext%20TOC.html) that converts certain plaintext tables of contents to HTML using a flex layout. This recently became an accessibility recommendation at DP.

----

 **2. Page Table Enhancer** is a TamperMonkey script that adjusts the appearance of Distributed Proofreaders page detail tables as follows. To install it, [follow this link](https://github.com/parchmentglow/dp-tools/raw/refs/heads/main/page-table-enhancer.user.js) with the TamperMonkey extension installed:
* Allows round columns to be hidden: P1 through F2. The setting is remembered until changed, using a cookie.
* By default, makes substantial adjustments to the style of the table. Round columns are differentially colored by round. There is a checkbox to turn this off.
* Simplifies many textual elements of a large, overly busy table in various ways, to reduce table width and legibility:
  * Changing "xx_page.{avail|saved|etc}" to "{avail|saved|etc}"
  * Changing "no diff" to a one-character symbol
  * removing *.png" from the filename and increasing the font size, since it's the "key" to the table row
  * usernames no longer break over a line; along with moving *(page count)* to "detail" mode, this allows the table's row height to be consistent: one text line without detail mode, two in detail mode.
  * removing first two digits of year and moving *time* into detail mode
* Adjusts the URL of F1 diffs so that formatting comparison is already on. (!!)
* Etc.
* Tested only in Firefox.

<figure>
  <img src="https://github.com/parchmentglow/dp-tools/blob/main/images/page-table-after-light.jpg?raw=true" width="800">
 <caption>Appearance of page tables with script. Slightly dated version.</caption>
</figure>


