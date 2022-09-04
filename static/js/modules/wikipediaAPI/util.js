async function getArticle(page, isMobile) {
    const resp = await fetch(
        `https://ja.wikipedia.org/w/api.php?redirects=1&disableeditsection=true&format=json&origin=*&action=parse&prop=text&page=${page}${isMobile ? '&mobileformat=1' : ''}`,
        {
            mode: "cors"
        }
    )

    const body = await resp.json()

    if ("error" in body) {
        return null;
    } else {
        return body["parse"];
    }
}

async function getArticleTitle(title) {
    const resp = await fetch(
        `https://ja.wikipedia.org/w/api.php?redirects=1&format=json&origin=*&action=parse&prop=displaytitle&page=${title}`, {
            mode: "cors"
        }
    )
    const body = await resp.json()

    if ("error" in body) {
        return null;
    } else {
        return body["parse"]["title"];
    }
}

async function articleCheck(title) {
    if (title.startsWith("File:") ||
        title.startsWith("Wikipedia:") ||
        title.startsWith("Category:") ||
        title.startsWith("Help:")) {
            return {warning: `ERROR: \'${title}\' is a namespaced article, may be impossible to reach. Please choose a different end article.`}
    }

    const resp = await fetch(
        `https://ja.wikipedia.org/w/api.php?action=query&origin=*&format=json&prop=categories&titles=${title}&cllimit=10`, {
            mode: "cors"
        }
    )
    const body = await resp.json()

    const id = Object.keys(body['query']['pages'])[0]
    const cats = body['query']['pages'][id]['categories']

    for (const cat of cats) {
        if (cat['title'] === "Category:All article disambiguation pages" || 
            cat['title'] === "Category:All disambiguation pages" || 
            cat['title'] === "Category:Disambiguation pages" || 
            cat['title'] === "Category:Disambiguation pages with short descriptions" ) {
            return {warning: `ERROR: \'${title}\' is a disambiguation page and may be impossible to reach. Try checking the full title of the intended article on Wikipedia.`}
        }
    }

    return {}
}

async function checkArticles(start, end) {
    const resp = {body: {}};

    if(!start || !end){
        resp.err = "Prompt is currently empty";
        return resp;
    }

    resp.body.start = await getArticleTitle(start);
    if (!resp.body.start) {
        resp.err = `"${start}" is not a Wikipedia article`;
        return resp;
    }

    resp.body.end = await getArticleTitle(end);
    if (!resp.body.end) {
        resp.err = `"${end}" is not a Wikipedia article`;
        return resp;
    }
    
    if(resp.body.start === resp.body.end) {
        resp.err = "The start and end articles are the same";
        return resp;
    }

    const checkRes = await articleCheck(resp.body.end);
    if ('warning' in checkRes) {
        resp.err = checkRes["warning"];
        return resp;
    }

    return resp;
}

async function getArticleSummary(page) {
    const encodedPage = encodeURIComponent(page);
    const resp = await fetch(
        `https://ja.wikipedia.org/api/rest_v1/page/summary/${encodedPage}`,
        {
            mode: "cors"
        }
    )
    const body = await resp.json()

    return body
}

async function getAutoCompleteArticles(search, numEntries = 5){
    // https://ja.wikipedia.org/w/api.php?action=opensearch&format=json&formatversion=2&search=a&namespace=0&limit=10
    const resp = await fetch(
        `https://ja.wikipedia.org/w/api.php?action=opensearch&origin=*&format=json&formatversion=2&search=${search}&namespace=0&limit=${numEntries}`,
        {
            mode: "cors"
        }
    )
    let body = await resp.json();
    body = body[1]; // get the list of araticles
    return body;
}

export { getArticle, getArticleTitle, getArticleSummary, articleCheck, checkArticles, getAutoCompleteArticles };
