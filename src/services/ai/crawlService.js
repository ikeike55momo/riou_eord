import puppeteer from 'puppeteer';
import cheerio from 'cheerio';

// Firecrawlの代替として、PuppeteerとCheerioを使用したクローリングサービス
const crawlService = {
  // Googleビジネスプロフィールからデータを取得
  async crawlGoogleBusinessProfile(businessName, location) {
    try {
      console.log(`Googleビジネスプロフィールのクローリングを開始: ${businessName}, ${location}`);
      
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      
      // Google検索URLを構築
      const searchQuery = encodeURIComponent(`${businessName} ${location}`);
      const url = `https://www.google.com/search?q=${searchQuery}`;
      
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      // ビジネス情報を含むHTMLを取得
      const html = await page.content();
      const $ = cheerio.load(html);
      
      // ビジネス情報の抽出
      const businessInfo = {
        name: $('.SPZz6b').text().trim() || businessName,
        rating: $('.Aq14fc').text().trim(),
        reviewCount: $('.hqzQac span').text().trim(),
        address: $('div[data-dtype="d3ifr"] span.LrzXr').text().trim(),
        phone: $('div[data-dtype="d3ph"] span.LrzXr').text().trim(),
        website: $('div[data-dtype="d3adr"] a').attr('href'),
        hours: $('.WgFkxc').text().trim(),
        description: $('.kno-rdesc span').text().trim(),
        categories: $('.wuQ4Ob').text().trim(),
        rawHtml: html // デバッグ用
      };
      
      await browser.close();
      
      console.log('Googleビジネスプロフィールのクローリングが完了しました');
      return { success: true, data: businessInfo };
    } catch (error) {
      console.error('Googleビジネスプロフィールのクローリングエラー:', error);
      return { success: false, error };
    }
  },
  
  // 公式ウェブサイトからデータを取得
  async crawlOfficialWebsite(websiteUrl) {
    try {
      console.log(`公式ウェブサイトのクローリングを開始: ${websiteUrl}`);
      
      if (!websiteUrl) {
        return { success: false, error: 'ウェブサイトURLが指定されていません' };
      }
      
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.goto(websiteUrl, { waitUntil: 'networkidle2', timeout: 60000 });
      
      // ウェブサイトのコンテンツを取得
      const html = await page.content();
      const $ = cheerio.load(html);
      
      // メタデータの抽出
      const title = $('title').text().trim();
      const description = $('meta[name="description"]').attr('content') || '';
      
      // テキストコンテンツの抽出
      let textContent = '';
      $('p, h1, h2, h3, h4, h5, h6, li').each((_, element) => {
        const text = $(element).text().trim();
        if (text) {
          textContent += text + '\n';
        }
      });
      
      // メニュー・サービス関連の情報を抽出
      let menuServices = '';
      $('*:contains("メニュー"), *:contains("サービス"), *:contains("menu"), *:contains("service")').each((_, element) => {
        const text = $(element).text().trim();
        if (text && text.length < 1000) { // 長すぎるテキストを除外
          menuServices += text + '\n';
        }
      });
      
      // 環境・設備関連の情報を抽出
      let facilities = '';
      $('*:contains("設備"), *:contains("環境"), *:contains("施設"), *:contains("facility"), *:contains("environment")').each((_, element) => {
        const text = $(element).text().trim();
        if (text && text.length < 1000) {
          facilities += text + '\n';
        }
      });
      
      // 利用シーン関連の情報を抽出
      let usageScenes = '';
      $('*:contains("利用シーン"), *:contains("おすすめ"), *:contains("使い方"), *:contains("recommended"), *:contains("usage")').each((_, element) => {
        const text = $(element).text().trim();
        if (text && text.length < 1000) {
          usageScenes += text + '\n';
        }
      });
      
      // 画像URLの抽出
      const imageUrls = [];
      $('img').each((_, element) => {
        const src = $(element).attr('src');
        if (src && !src.includes('data:image')) {
          // 相対パスを絶対パスに変換
          const absoluteSrc = new URL(src, websiteUrl).href;
          imageUrls.push(absoluteSrc);
        }
      });
      
      await browser.close();
      
      const websiteData = {
        title,
        description,
        textContent: textContent.substring(0, 10000), // 長すぎる場合は切り詰め
        menuServices: menuServices.substring(0, 5000),
        facilities: facilities.substring(0, 5000),
        usageScenes: usageScenes.substring(0, 5000),
        imageUrls: imageUrls.slice(0, 20), // 最大20枚の画像に制限
        url: websiteUrl
      };
      
      console.log('公式ウェブサイトのクローリングが完了しました');
      return { success: true, data: websiteData };
    } catch (error) {
      console.error('公式ウェブサイトのクローリングエラー:', error);
      return { success: false, error };
    }
  }
};

export default crawlService;
