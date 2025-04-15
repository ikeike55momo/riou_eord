/**
 * キーワード生成サービス
 * 施設情報からAIを使用してキーワードを生成します
 */

import { OpenAI } from 'openai';
import logger from '../../utils/logger.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemMessage = `
あなたはプロのレストランコンサルタントです。与えられた施設の情報から最適なキーワードを生成します。

以下の制約条件と出力形式を厳密に守ってください。

制約条件：
- 施設情報は、JSON形式で与えられます。
- 提供された施設情報の範囲内でキーワードを生成してください。
- キーワードは必ず３つのカテゴリに分けてください。
- キーワードは、1単語から３単語の範囲にしてください。
- キーワードは、最大で50個までにしてください。
- 生成するキーワードは、日本語で出力してください。

出力形式：
\`\`\`json
{
  "menu_service": [
    "キーワード１",
    "キーワード２",
    ...
  ],
  "environment_facility": [
    "キーワード１",
    "キーワード２",
    ...
  ],
  "recommended_scene": [
    "キーワード１",
    "キーワード２",
    ...
  ]
}
\`\`\`
`;

/**
 * 施設情報に基づいたキーワードを生成する
 * @param {Object} facility - 施設情報
 * @returns {Promise<Object>} - 生成されたキーワード
 */
const generateKeywords = async (facility) => {
  if (!facility) {
    throw new Error('施設情報が提供されていません');
  }

  logger.info(`施設「${facility.facility_name}」のキーワード生成を開始します`);

  const userMessage = JSON.stringify(facility, null, 2);

  const chatCompletion = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: systemMessage },
      { role: 'user', content: userMessage },
    ],
    model: 'gpt-4-1106-preview',
  });

  const generatedText = chatCompletion.choices[0].message.content;

  let keywords = JSON.parse(generatedText)
  logger.info(`施設「${facility.facility_name}」のキーワード生成が完了しました`);
  return keywords;
  }

export default { generateKeywords };
