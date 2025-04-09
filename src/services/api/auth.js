import NextAuth from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { supabaseAdmin } from '../supabase.js';

// NextAuth設定
export const authOptions = {
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST || 'smtp.example.com',
        port: process.env.EMAIL_SERVER_PORT || 587,
        auth: {
          user: process.env.EMAIL_SERVER_USER || 'user',
          pass: process.env.EMAIL_SERVER_PASSWORD || 'password',
        },
      },
      from: process.env.EMAIL_FROM || 'noreply@example.com',
    }),
  ],
  // Supabaseをセッションストアとして使用
  adapter: {
    async createUser(user) {
      const { data, error } = await supabaseAdmin
        .from('users')
        .insert([
          {
            email: user.email,
            role: 'USER', // デフォルトロール
          },
        ])
        .select();
      
      if (error) throw error;
      return data[0];
    },
    async getUser(id) {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) return null;
      return data;
    },
    async getUserByEmail(email) {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error) return null;
      return data;
    },
    async updateUser(user) {
      const { data, error } = await supabaseAdmin
        .from('users')
        .update({
          email: user.email,
          updated_at: new Date(),
        })
        .eq('id', user.id)
        .select();
      
      if (error) throw error;
      return data[0];
    },
    async deleteUser(userId) {
      const { error } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      return;
    },
    async createSession(session) {
      // セッション管理はNextAuthに任せる
      return session;
    },
    async getSessionAndUser(sessionToken) {
      // セッション管理はNextAuthに任せる
      return null;
    },
    async updateSession(session) {
      // セッション管理はNextAuthに任せる
      return session;
    },
    async deleteSession(sessionToken) {
      // セッション管理はNextAuthに任せる
      return;
    },
    async createVerificationToken(verificationToken) {
      // 検証トークン管理はNextAuthに任せる
      return verificationToken;
    },
    async useVerificationToken(params) {
      // 検証トークン管理はNextAuthに任せる
      return null;
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      // ユーザー情報をトークンに追加
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // セッションにユーザー情報を追加
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  // Netlifyデプロイ時のUntrustedHostエラー対策
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
};

export default NextAuth(authOptions);
