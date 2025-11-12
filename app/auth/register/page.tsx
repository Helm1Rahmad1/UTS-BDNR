import RegisterForm from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Create Account</h1>
        <p className="text-muted-foreground mt-2">Join us to start shopping</p>
      </div>
      <RegisterForm />
    </div>
  )
}
