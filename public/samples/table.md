## Markdown table: How to Create a Great Looking Table
Markdown tables are not part of the original Markdown spec. Instead, it was suggested to use the HTML **\<table\>** tag. Although that works well, it looks messy. Luckily, there are now better options, since subsequent Markdown specs like GitHub Flavoured Markdown (GFM) and Markdown Here do support Markdown tables. In fact, most modern Markdown parsers support tables as described on this page. In case of doubt, my advice is always to simply try if it works.


### To-do's
- [ ] Templating example
- [x] Save sequence for replay
- [ ] Example connect


### A basic Markdown table
A table is ‘drawn’ using something resembling ASCII art. You can make it look as pretty or as ugly as you want:

| Item         | Price     | # In stock |
|--------------|-----------|------------|
| Juicy Apples | 1.99      | *7*        |
| Bananas      | **1.89**  | 5234       |

A few things to note:

Start with a header row
* Use at least 3 dashes to separate the header cells
* Separate cells with a pipe symbol: |
* Outer pipes are optional
* Cells can contain markdown syntax. See our Markdown cheat sheet for all the Markdown formatting you might need.
You don’t need to make the table look pretty. This will give the exact same result as the table above:

Item | Price | # In stock
---|---|---
Juicy Apples | 1.99 | 739
Bananas | 1.89 | 6


### Aligning columns
You can align columns to the left, center, or right. Alignment is specific around the dashes below the header cell:

To align left, add a colon to the left, like :--- (this is the default)
For right alignment, add a colon to the right, like: ---:
And finally, for center alignment, add two colons, like: :---:
Here’s our product table again, with center-aligned prices and right-aligned stock information. Note that I nicely aligned the text in the entire column, but you don’t have to:

| Item         | Price | # In stock |
|--------------|:-----:|-----------:|
| Juicy Apples |  1.99 |        739 |
| Bananas      |  1.89 |          6 |
