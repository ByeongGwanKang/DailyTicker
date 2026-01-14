// services/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// [디버깅] 값이 잘 들어왔는지 콘솔에 출력 (비밀번호는 앞 5자리만)
console.log("Checking Env Vars:", { 
  url: supabaseUrl, 
  key: supabaseKey ? supabaseKey.substring(0, 5) + '...' : 'MISSING' 
});

if (!supabaseUrl || !supabaseKey) {
  // 에러를 던지지 않고 경고만 남김 (앱이 멈추지 않게)
  console.error("🚨 Critical Error: Supabase URL or Key is missing!");
}

// 값이 없어도 일단 빈 문자열로 클라이언트를 만들어서 앱이 '켜지게' 함
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseKey || 'placeholder-key'
);