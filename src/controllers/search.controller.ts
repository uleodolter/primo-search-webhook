import { Request, Response } from "express";
import wiki from 'wikipedia';
import { wikiSearchResult, wikiSummary, summaryError } from 'wikipedia';

export default class SearchController {
  async findAll(req: Request, res: Response) {
    let limit = 10;
    let offset = 0;
    let query = ''; 
    const token = req.query.token;

    if (typeof req.query.bulkSize === 'string') {
        limit = parseInt(req.query.bulkSize);
    }
    if (typeof req.query.from === 'string') {
        offset = parseInt(req.query.from) - 1;
    }
    if (typeof req.query.query == 'string') {
        query = req.query.query;
    }

    const pnxResult: any = {
        docs: [],
        facets: [],
        info: {}
    };

    await wiki.setLang('de');
    const searchResults: wikiSearchResult = await wiki.search(query, {
      limit: limit
    });
    for (const result of searchResults.results) {
        const page = await wiki.page(result.pageid);
        try {
            const summary: wikiSummary = await page.summary();
            const categories = await page.categories();
            const references = await page.references();

            const control: any = {
                sourceid: [],
                recordid: [],
                sourcerecordid: [],
                sourcesystem: [] };
            const display: any = {
                type: [],
                title: [],
                subject: [],
                source: [],
                language: [],
                description: [],
                abstract: []
            };
            const delivery: any = {
                delcategory: [],
                fulltext: []
            };
            const links: any = { linktorsrc: [], thumbnail: [], additionallinks: [] };

            control.sourceid.push('Wikipedia');
            control.recordid.push(`Wikipedia${summary.pageid}`);
            control.sourcerecordid.push(`${summary.pageid}`);
            control.sourcesystem.push('wikipedia');
            
            delivery.delcategory.push('Remote Search Resource');
            delivery.fulltext.push('fulltext_linktorsrc');

            display.type.push('article');
            display.title.push(summary.title);
            display.source.push('Wikipedia');
            display.language.push('ger');
            display.description.push(summary.description);
            display.abstract.push(summary.extract_html);
            let subject = '';
            for (const category in categories) {
                if (subject.length > 0) {
                    subject += '; ';
                }
                // remove Kategorie:
                subject += category.substr(10); 
            }
            display.subject.push(subject);

            links.linktorsrc.push(`$$U${page.fullurl}$$DWikipedia`);
            try {
                links.linktorsrc.push(`$$U${summary.thumbnail.source}$$DThumbnail`);
            } catch (error) {
                console.log('thumbnail missing');
            }
            for (const ref in references) {
                if (ref.startsWith('https://d-nb.info')) {
                    links.additionallinks.push(`$$U${ref}$$DLink zu GND`);
                }
                if (ref.startsWith('https://lobid.org')) {
                    links.additionallinks.push(`$$U${ref}$$DLink zu Lobid`);
                }
                if (ref.startsWith('https://viaf.org')) {
                    links.additionallinks.push(`$$U${ref}$$DLink zu Viaf`);
                }
                if (ref.startsWith('https://zdb-katalog.de')) {
                    links.additionallinks.push(`$$U${ref}$$DLink zu ZDB`);
                }
            }

            pnxResult.docs.push({
                pnx: {
                    control: control,
                    delivery: delivery,
                    display: display,
                    links: links
                }
            });
        }
        catch (error) {
            console.log(error);
        }
    }
    pnxResult.info = {
        total: pnxResult.docs.length,
        first: 1,
        last: pnxResult.docs.length
    };

    try {
      res.status(200).json(pnxResult);
    } catch (err) {
      res.status(500).json({
        message: "Internal Server Error!"
      });
    }
  }

  async findOne(req: Request, res: Response) {
    try {
      res.status(200).json({
        message: "findOne OK",
        reqParamId: req.params.id
      });
    } catch (err) {
      res.status(500).json({
        message: "Internal Server Error!"
      });
    }
  }
}
