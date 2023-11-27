import { Request, Response } from "express";
import wiki from 'wikipedia';
import { wikiSearchResult, wikiSummary, summaryError } from 'wikipedia';

export default class SearchController {
  async findAll(req: Request, res: Response) {
    let limit: number = 10;
    let offset: number = 0;
    let query: string = ''; 
    const token = req.query.token;

    if (typeof req.query.bulkSize === 'string') {
        try {
           limit = parseInt(req.query.bulkSize);
        }
        catch (err) {
        }
    }
    if (typeof req.query.from === 'string') {
        try {
            offset = parseInt(req.query.from) - 1;
        }
        catch (err) {
        }
    }
    if (typeof req.query.query == 'string') {
        query = req.query.query;
    }

    let pnxResult: any = {
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
            const summary = await page.summary();

            console.log(summary);

            const control: any = { sourceid: [], recordid: [], sourcerecordid: [], sourcesystem: [] };
            const display: any = { type: [], title: [], source: [], language: [], description: [], abstract: [] };
            const links: any = { linktorsrc: [] };

            control.sourceid.push('Wikipedia');
            control.recordid.push(`Wikipedia${summary.pageid}`);
            control.sourcerecordid.push(summary.pageid);
            control.sourcesystem.push('wikipedia');

            display.type.push('article');
            display.title.push(summary.title);
            display.source.push('Wikipedia');
            display.language.push('ger');
            display.description.push(summary.description);
            display.abstract.push(summary.extract_html);

            links.linktorsrc.push(page.fullurl);

            pnxResult.docs.push({ control: control, display: display, links: links });
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
