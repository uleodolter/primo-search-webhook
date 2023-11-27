import { Request, Response } from "express";
import wiki from 'wikipedia';
import { wikiSearchResult, wikiSummary } from 'wikipedia';

export default class SearchController {
    async findAll(req: Request, res: Response) {
        let query = ''; 
        let limit = 10;
        // let offset = 0;
        // const token = req.query.token;

        if (typeof req.query.bulkSize === 'string') {
            limit = parseInt(req.query.bulkSize);
        }
        // if (typeof req.query.from === 'string') {
        //    offset = parseInt(req.query.from) - 1;
        // }
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
                };
                const delivery: any = {
                    delcategory: [],
                    fulltext: []
                };
                const links: any = { linktorsrc: [], thumbnail: [], addlink: [] };

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
                if (summary.extract_html) {
                    display.lds03 = [summary.extract_html];
                }
                for (const category of categories) {
                    if (category.startsWith('Kategorie:')) {
                        display.subject.push(category.substr(10)); 
                    }
                }

                links.linktorsrc.push(`$$U${page.fullurl}$$DWikipedia`);
                if ('thumbnail' in summary) {
                    links.thumbnail.push(`$$U${summary.thumbnail.source}$$DThumbnail`);
                }
                for (const ref of references) {
                    if (ref.startsWith('https://d-nb.info')) {
                        links.addlink.push(`$$U${ref}$$DLink zu GND`);
                    }
                    if (ref.startsWith('https://lobid.org')) {
                        links.addlink.push(`$$U${ref}$$DLink zu Lobid`);
                    }
                    if (ref.startsWith('https://viaf.org')) {
                        links.addlink.push(`$$U${ref}$$DLink zu Viaf`);
                    }
                    if (ref.startsWith('https://zdb-katalog.de')) {
                        links.addlink.push(`$$U${ref}$$DLink zu ZDB`);
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
}
