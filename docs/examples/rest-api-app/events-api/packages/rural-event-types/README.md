# data-text-mapper

The `data-text-mapper` contains some utility functions to convert a structured text with link, tag and scope metadata into a combined plain text or html. As well it's made for encode an decode again.

An example use case where it was made for, is to convert structured data given e.g. in ics event data to simplier google events by encoding the metadata inside the description.

## Examples

### dataToText()

```
const data: TextWithData = {
    description: "Lorem Ipsum",
    url: "https://www.domain.com/",
    tags: ["One", "Two", "Three"],
    scopes: ["One", "Two", "Three"],
};

dataToText(data);
```

returns

```
Lorem Ipsum

https://www.domain.com/

#One #Two #Three @One @Two @Three
```

### textToData()

Transforms back the given html to a data object.

### dataToHtml()

```
const data: TextWithData = {
    description: "Lorem Ipsum",
    url: "https://www.domain.com/",
    tags: ["One", "Two"],
    scopes: ["Three", "Four"],
};

dataToHtml(data)
```

returns

```
<p class="description">Lorem Ipsum</p>
<p class="link"><a href="https://www.domain.com/">https://www.domain.com/</a></p>
<p class="taxonomy"><span class="tag">#One</span> <span class="tag">#Two</span> <span class="scope">@Three</span> <span class="scope">@Four</span></p>
```

### htmlToData()

Transforms back the given html to a data object.

## More details

For more details and edge case description please take a look into the unit tests.

## Disclaimer

Not all functions are written that clean as expected. Improvements will we tracked in [github issues](https://github.com/schafevormfenster/events-api/issues). Please mention that 'data-text-mapper' is part of the upcoming 'events-api'.
