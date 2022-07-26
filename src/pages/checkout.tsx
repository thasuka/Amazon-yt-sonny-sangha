import Image from "next/image";
import { useSelector } from "react-redux";
import { CheckoutProduct } from "../../components/CheckoutProduct";
import { selectItems, selectTotal } from "../slices/basketSlice";
import Currency from 'react-currency-formatter';
import { useSession } from "next-auth/client";
import { loadStripe } from "@stripe/stripe-js";
import axios from 'axios'


const stripePromise = loadStripe(String(process.env.stripe_public_key));

export default function Checkout() {

  const basketItems = useSelector(selectItems);
  const [session] = useSession();
  const total = useSelector(selectTotal);

  const createCheckoutSession = async () => {
    const stripe = await stripePromise;


    if(session && stripe!= null){
      const checkoutSession = await axios.post('/api/create-checkout-session',
      {
        items: basketItems,
        email: session.user?.email
      })

      const result = await stripe.redirectToCheckout({
        sessionId: checkoutSession.data.id
      })

      if (result.error){
        alert(result.error.message)
      }

    }
  }
  return (
    <div className="bg-gray-100">
      <main
        className="
          lg:flex max-w-screen-2xl mx-auto
        ">
        {/* left */}
        <div className="flex-grow m-5 shadow-sm">
          <Image
            src="https://links.papareact.com/ikj"
            width={1020}
            height={250}
            objectFit="contain"
          />

          <div className="flex flex-col p-5 space-y-10 bg-white">
            <h1 className="text-3xl border-b pb-4">
              {
                basketItems.length == 0
                  ? `Your Shopping Basket`
                  : `Shopping Basket`
              }
            </h1>


            {basketItems.map((item: any, i: number) => {
              return (
                <CheckoutProduct product={item} key={i} />
              )
            })}
          </div>
        </div>


        {/* right */}

        <div className="flex flex-col bg-white p-10 shadow-md">
          {basketItems.length > 0 && (
            <>

              <h2 className="whitespace-nowrap font-bold">Subtotal ({basketItems.length} items):{" "}
                <span className="font-bold">
                  <Currency quantity={total} currency="GBP" />
                </span>
              </h2>

              <button
                role="link"
                disabled={!session}
                onClick={createCheckoutSession}
                className={`button mt-2
                  ${!session && 'from-gray-300 to-gray-500 border-gray-200 text-gray-300 cursor-not-allowed'}
                `}
              >
                {!session
                  ? 'Sign in to checkout'
                  : "Proceed to checkout"
                }
              </button>
            </>

          )}
        </div>
      </main>

    </div>

  )

}