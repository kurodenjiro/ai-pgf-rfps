"use client";
import { useState, useEffect, useRef } from 'react'
import { useWalletSelector } from "@/app/contexts/WalletSelectorContext"
import { useFormState, useFormStatus } from 'react-dom'
import { authenticate } from '@/app/login/actions'
import { getUser } from '@/app/login/actions'
import { signup } from '@/app/signup/actions'
import { toast } from 'sonner'
import { getMessageFromCode } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { signOut } from '@/auth'
import { Session } from '@/lib/types'
import { auth } from '@/auth'

export function ConnectWalletButton() {
    const [resultSignUp, dispatchSignIn] = useFormState(authenticate, undefined)
    const [resultSignIn, dispatchSignUp] = useFormState(signup, undefined)
    const [email, setEmail] = useState('');
    const [isUser, setIsUser] = useState(false);
    const [isSubmit, setIsSubtmit] = useState(false);
    const [password, setPassword] = useState('password');
    const formRef = useRef<HTMLFormElement>(null)
    const formSignOut = useRef<HTMLFormElement>(null)
    const { pending } = useFormStatus()

    const router = useRouter()
    useEffect(() => {
        if (resultSignIn) {
            console.log("result", resultSignIn)
            if (resultSignIn.type === 'error') {
                toast.error(getMessageFromCode(resultSignIn.resultCode))
            } else {
                toast.success(getMessageFromCode(resultSignIn.resultCode))
                router.refresh()
            }
        }
    }, [resultSignIn, router])

    useEffect(() => {
        if (resultSignUp) {
            console.log("result", resultSignUp)
            if (resultSignUp.type === 'error') {
                toast.error(getMessageFromCode(resultSignUp.resultCode))
            } else {
                toast.success(getMessageFromCode(resultSignUp.resultCode))
                router.refresh()
            }
        }

    }, [resultSignUp, router])


    const { modal, accountId, selector } = useWalletSelector();
    useEffect(() => {
        if (accountId) {

        }

    }, [accountId])
    const handleSignIn = () => {
        modal.show();
    };
    modal.on("onHide", async ({ hideReason }) => {
        console.log(`The reason for hiding the modal ${hideReason}`);
        console.log(`isSubmit${isSubmit}`);
        if (hideReason == 'wallet-navigation' && accountId && !isSubmit) {
            await setIsSubtmit(true);
            console.log("user",pending)
            if (!pending) {
                const email = accountId + '@mail.com'
                await setEmail(email)
                const user = await getUser(email)
                console.log("user", user)
                if (user) {
                    await setIsUser(true)
                }
                await formRef.current?.requestSubmit()
            }
        }
    });

    const handleSignOut = async () => {
        const wallet = await selector.wallet();
        wallet.signOut().catch((err: string) => {
            formSignOut.current?.requestSubmit()
            console.log("Failed to sign out");
            console.error(err);
        });
    };
    return (
        <form
            action={isUser ? dispatchSignIn : dispatchSignUp}
            ref={formRef}
        >
            <button
                className="flex p-1 border border-gray-600 rounded-md px-4 py-2 hover:bg-gray-700/50 transition-colors"
                onClick={handleSignIn}
            >
                Connect Wallet
            </button>
            <input
                className="peer block w-full rounded-md border bg-zinc-50 px-2 py-[9px] hidden text-sm outline-none placeholder:text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950"
                id="email"
                name="email"
                placeholder="Enter your email address"
                value={email}
                required
            />
            <input
                className="peer block w-full rounded-md border bg-zinc-50 px-2 py-[9px] hidden text-sm outline-none placeholder:text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950"
                id="password"
                name="password"
                placeholder="Enter your email address"
                value={password}
                required
            />
            <button
                className="flex p-1 border border-gray-600 rounded-md px-4 py-2 hover:bg-gray-700/50 transition-colors"
                onClick={handleSignOut}
            >
                Signout
            </button>
        </form>
    )
}