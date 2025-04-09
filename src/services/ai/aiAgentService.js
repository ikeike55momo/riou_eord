import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from 'langchain/prompts';
import { StringOutputParser } from 'langchain/schema/output_parser';
import crawlService from './crawlService.js';

// AIエージェントサービス
const aiAgentService = {
  // OpenAI APIキー（実際の環境では環境変数から取得）
  openaiApiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key',
  
  // LLMモデルの初期化
  initLLM() {
    return new ChatOpenAI({
      openAIApiKey: this.openaiApiKey,
      modelName: 'gpt-4',
      temperature: 0.7,
    });
  },
  
  // 施設情報とクローリングデータを要約
  async summarizeData(facilityData, googleBusinessData, websiteData) {
    try {
      console.log('施設データの要約を開始します');
      
      const llm = this.initLLM();
      
      const summarizationPrompt = PromptTemplate.fromTemplate(`
        あなたは施設情報を分析し、要約するAIアシスタントです。
        以下の情報を分析し、施設の特徴を簡潔に要約してください。

        ## 施設基本情報
        {facilityInfo}

        ## Googleビジネスプロフィール情報
        {googleBusinessInfo}

        ## 公式ウェブサイト情報
        {websiteInfo}

        要約（500文字以内）:
      `);
      
      // 施設情報をテキスト形式に変換
      const facilityInfo = Object.entries(facilityData)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
      
      // Googleビジネス情報をテキスト形式に変換
      const googleBusinessInfo = googleBusinessData && googleBusinessData.success
        ? Object.entries(googleBusinessData.data)
            .filter(([key]) => key !== 'rawHtml') // 生HTMLは除外
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n')
        : '情報なし';
      
      // ウェブサイト情報をテキスト形式に変換
      const websiteInfo = websiteData && websiteData.success
        ? `タイトル: ${websiteData.data.title}
           説明: ${websiteData.data.description}
           メニュー・サービス情報: ${websiteData.data.menuServices}
           環境・設備情報: ${websiteData.data.facilities}
           利用シーン情報: ${websiteData.data.usageScenes}`
        : '情報なし';
      
      const chain = summarizationPrompt
        .pipe(llm)
        .pipe(new StringOutputParser());
      
      const summary = await chain.invoke({
        facilityInfo,
        googleBusinessInfo,
        websiteInfo
      });
      
      console.log('施設データの要約が完了しました');
      return { success: true, data: summary };
    } catch (error) {
      console.error('施設データの要約エラー:', error);
      return { success: false, error };
    }
  },
  
  // キーワード生成
  async generateKeywords(facilityData, summary) {
    try {
      console.log('キーワード生成を開始します');
      
      const llm = this.initLLM();
      
      const keywordGenerationPrompt = PromptTemplate.fromTemplate(`
        あなたは施設のSEO/MEO最適化のためのキーワード提案AIです。
        以下の施設情報と要約を分析し、3つのカテゴリに分けてキーワードを生成してください。
        各キーワードは短く、検索に適した形式にしてください。

        ## 施設情報
        {facilityInfo}

        ## 要約
        {summary}

        以下の3カテゴリに分けて、それぞれ5〜10個のキーワードを提案してください。
        キーワードはカンマ区切りで出力してください。

        # メニュー・サービス
        # 環境・設備
        # おすすめの利用シーン
      `);
      
      // 施設情報をテキスト形式に変換
      const facilityInfo = Object.entries(facilityData)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
      
      const chain = keywordGenerationPrompt
        .pipe(llm)
        .pipe(new StringOutputParser());
      
      const keywordsText = await chain.invoke({
        facilityInfo,
        summary
      });
      
      // 出力テキストからカテゴリごとのキーワードを抽出
      const menuServicesMatch = keywordsText.match(/# メニュー・サービス\s*\n([\s\S]*?)(?=# 環境・設備|$)/);
      const environmentFacilitiesMatch = keywordsText.match(/# 環境・設備\s*\n([\s\S]*?)(?=# おすすめの利用シーン|$)/);
      const recommendedScenesMatch = keywordsText.match(/# おすすめの利用シーン\s*\n([\s\S]*?)(?=$)/);
      
      const keywords = {
        menu_services: menuServicesMatch ? menuServicesMatch[1].trim() : '',
        environment_facilities: environmentFacilitiesMatch ? environmentFacilitiesMatch[1].trim() : '',
        recommended_scenes: recommendedScenesMatch ? recommendedScenesMatch[1].trim() : ''
      };
      
      console.log('キーワード生成が完了しました');
      return { success: true, data: keywords };
    } catch (error) {
      console.error('キーワード生成エラー:', error);
      return { success: false, error };
    }
  },
  
  // 施設情報からキーワードを生成する統合プロセス
  async processKeywordGeneration(facilityData) {
    try {
      console.log(`施設「${facilityData.facility_name}」のキーワード生成プロセスを開始します`);
      
      // 1. Googleビジネスプロフィールのクローリング
      const googleBusinessData = await crawlService.crawlGoogleBusinessProfile(
        facilityData.facility_name,
        facilityData.address || ''
      );
      
      // 2. 公式ウェブサイトのクローリング
      let websiteUrl = '';
      
      // GoogleビジネスプロフィールからウェブサイトURLを取得
      if (googleBusinessData.success && googleBusinessData.data.website) {
        websiteUrl = googleBusinessData.data.website;
      }
      
      const websiteData = await crawlService.crawlOfficialWebsite(websiteUrl);
      
      // 3. データの要約
      const summaryResult = await this.summarizeData(
        facilityData,
        googleBusinessData,
        websiteData
      );
      
      if (!summaryResult.success) {
        throw new Error('データの要約に失敗しました');
      }
      
      // 4. キーワード生成
      const keywordsResult = await this.generateKeywords(
        facilityData,
        summaryResult.data
      );
      
      if (!keywordsResult.success) {
        throw new Error('キーワードの生成に失敗しました');
      }
      
      console.log(`施設「${facilityData.facility_name}」のキーワード生成プロセスが完了しました`);
      return {
        success: true,
        data: {
          keywords: keywordsResult.data,
          summary: summaryResult.data,
          crawlData: {
            googleBusiness: googleBusinessData.success ? googleBusinessData.data : null,
            website: websiteData.success ? websiteData.data : null
          }
        }
      };
    } catch (error) {
      console.error('キーワード生成プロセスエラー:', error);
      return { success: false, error };
    }
  }
};

export default aiAgentService;
