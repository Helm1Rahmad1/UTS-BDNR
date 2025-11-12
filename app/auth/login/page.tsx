import LoginForm from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Sign In</h1>
        <p className="text-muted-foreground mt-2">Access your account</p>
      </div>
      <LoginForm />
    </div>
  )
}
