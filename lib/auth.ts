import { getIronSession, type IronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type AdminSessionData = {
  isLoggedIn?: boolean;
  username?: string;
};

const DEV_PREVIEW_SESSION_SECRET = "dev-preview-session-secret-1234567890";

export class CmsAuthError extends Error {
  status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.name = "CmsAuthError";
    this.status = status;
  }
}

const SESSION_COOKIE_NAME = "cms_admin_session";
const REQUIRED_ENV_VARS = [
  "CMS_ADMIN_USERNAME",
  "CMS_ADMIN_PASSWORD",
  "CMS_SESSION_SECRET",
] as const;

function readEnv(name: (typeof REQUIRED_ENV_VARS)[number]) {
  const value = process.env[name];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

export function getAuthConfigError() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !readEnv(key));

  if (missing.length > 0) {
    return `CMS 配置缺失：${missing.join(", ")}`;
  }

  const sessionSecret = readEnv("CMS_SESSION_SECRET");

  if (sessionSecret && sessionSecret.length < 32) {
    return "CMS_SESSION_SECRET 至少需要 32 个字符。";
  }

  return null;
}

export function isDevPreviewAuthAvailable() {
  return process.env.NODE_ENV === "development" && !!getAuthConfigError();
}

function getSessionOptions(): SessionOptions {
  const configError = getAuthConfigError();

  if (configError) {
    if (isDevPreviewAuthAvailable()) {
      return {
        password: DEV_PREVIEW_SESSION_SECRET,
        cookieName: SESSION_COOKIE_NAME,
        cookieOptions: {
          httpOnly: true,
          sameSite: "lax",
          secure: false,
          path: "/",
        },
      };
    }

    throw new Error(configError);
  }

  return {
    password: readEnv("CMS_SESSION_SECRET") as string,
    cookieName: SESSION_COOKIE_NAME,
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    },
  };
}

export async function getAdminSession() {
  return getIronSession<AdminSessionData>(await cookies(), getSessionOptions());
}

export async function requireAdminUser() {
  const session = await getAdminSession();

  if (!session.isLoggedIn) {
    redirect("/admin/login");
  }

  return session;
}

export async function requireAdminApiUser() {
  const session = await getAdminSession();

  if (!session.isLoggedIn) {
    throw new CmsAuthError("未登录或登录状态已失效。", 401);
  }

  return session;
}

export async function redirectIfAuthenticated() {
  const session = await getAdminSession();

  if (session.isLoggedIn) {
    redirect("/admin");
  }
}

export async function loginAdmin(username: string) {
  const session = await getAdminSession();
  session.isLoggedIn = true;
  session.username = username;
  await session.save();
}

export async function logoutAdmin(session?: IronSession<AdminSessionData>) {
  const currentSession = session ?? (await getAdminSession());
  await currentSession.destroy();
}

export function verifyAdminCredentials(username: string, password: string) {
  const configError = getAuthConfigError();

  if (configError) {
    return {
      ok: false as const,
      error: configError,
    };
  }

  const expectedUsername = readEnv("CMS_ADMIN_USERNAME");
  const expectedPassword = readEnv("CMS_ADMIN_PASSWORD");

  if (username !== expectedUsername || password !== expectedPassword) {
    return {
      ok: false as const,
      error: "用户名或密码错误。",
    };
  }

  return {
    ok: true as const,
  };
}
