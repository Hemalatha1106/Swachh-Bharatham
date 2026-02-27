'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Leaf, Mail } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmail() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <Mail className="w-12 h-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-700">
            Verify Your Email
          </CardTitle>
          <CardDescription>We've sent a confirmation link to your email</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 border border-green-200 p-4 rounded text-center text-sm text-gray-600">
            <p className="mb-2">Please check your email and click the confirmation link to complete your signup.</p>
            <p className="text-xs text-gray-500">The link will expire in 24 hours.</p>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">Didn't receive the email?</p>
            <Button
              variant="outline"
              className="w-full border-green-600 text-green-600 hover:bg-green-50"
            >
              Resend Verification Email
            </Button>
          </div>

          <div className="border-t border-gray-200 pt-4 text-center">
            <Link href="/auth/login" className="text-green-600 hover:text-green-700 text-sm font-medium">
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
