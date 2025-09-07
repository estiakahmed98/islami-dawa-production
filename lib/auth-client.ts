"use client";

import {
  signIn as nextSignIn,
  signOut as nextSignOut,
  useSession as useNextSession,
  getSession,
} from "next-auth/react";

// Minimal client shim to keep existing call-sites working.
export const signIn = {
  email: async (data: any, hooks?: any) => {
    // Use Credentials provider
    try {
      hooks?.onRequest?.();
      const res = await nextSignIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });
      if (res?.error) hooks?.onError?.({ error: { message: res.error } });
      else hooks?.onSuccess?.(res);
    } catch (err: any) {
      hooks?.onError?.({ error: { message: err.message || "Signin failed" } });
    } finally {
      hooks?.onFinally?.();
    }
  },
  social: async (opts: any, hooks?: any) => {
    try {
      hooks?.onRequest?.();
      // provider is expected to be "google"
      await nextSignIn(opts.provider || "google", {
        callbackUrl: opts.callbackURL || "/",
      });
      hooks?.onSuccess?.();
    } catch (err: any) {
      hooks?.onError?.({
        error: { message: err.message || "Social signin failed" },
      });
    } finally {
      hooks?.onFinally?.();
    }
  },
};

export const signUp = {
  email: async (data: any, hooks?: any) => {
    try {
      hooks?.onRequest?.();
      const res = await fetch("/api/public-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok)
        throw new Error(json?.error || json?.message || "Signup failed");
      hooks?.onSuccess?.(json);
    } catch (err: any) {
      hooks?.onError?.({ error: { message: err.message } });
    } finally {
      hooks?.onFinally?.();
    }
  },
};

export const signOut = nextSignOut;
export const useSession = useNextSession;

// Admin shim: call server endpoints that perform admin actions using server session
export const admin = {
  createUser: async (data: any, hooks?: any) => {
    try {
      hooks?.onRequest?.();
      const res = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok)
        throw new Error(json?.error || json?.message || "Create user failed");
      hooks?.onSuccess?.(json);
      return json;
    } catch (err: any) {
      hooks?.onError?.({ error: { message: err.message } });
      throw err;
    } finally {
      hooks?.onFinally?.();
    }
  },
};

export { getSession };
