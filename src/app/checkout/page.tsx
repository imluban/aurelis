"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/lib/products";
import { bangladeshDivisions } from "@/lib/bangladesh";
import {
  isCustomerSelectablePoliceStation,
  steadfastDistricts,
} from "@/lib/steadfast-locations";

// Steadfast uses a few legacy spellings that differ from the public district list.
const steadfastDistrictAliases: Record<string, string> = {
  Bogra: "Bogura",
  Chittagong: "Chattogram",
  Khagrachori: "Khagrachhari",
  Kustia: "Kushtia",
  Laxmipur: "Lakshmipur",
  Narshindi: "Narsingdi",
  Panchgarh: "Panchagarh",
  Shatkhira: "Satkhira",
};

function getPublicDistrictName(steadfastName: string): string {
  if (steadfastName === "Dhaka City" || steadfastName === "Dhaka Sub-Urban") {
    return "Dhaka";
  }

  return steadfastDistrictAliases[steadfastName] ?? steadfastName;
}

export default function CheckoutPage() {
  const { items, updateQuantity, removeItem } = useCart();

  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [submitted, setSubmitted] = useState(false);
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [selectedPoliceStationId, setSelectedPoliceStationId] = useState("");

  const selectedDistrict = steadfastDistricts.find(
    (district) => String(district.id) === selectedDistrictId,
  );

  const selectedPoliceStations =
    selectedDistrict?.policestations.filter(
      isCustomerSelectablePoliceStation,
    ) ?? [];

  const selectedPoliceStation = selectedPoliceStations.find(
    (station) => String(station.id) === selectedPoliceStationId,
  );

  const selectedPublicDistrictName = selectedDistrict
    ? getPublicDistrictName(selectedDistrict.name)
    : "";

  const selectedDivision = bangladeshDivisions.find((division) =>
    division.districts.includes(selectedPublicDistrictName),
  )?.name;

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-[#f8f4ed] text-[#470d20]">
      {/* HEADER */}
      <header className="border-b border-[#470d20]/15 bg-[#f8f4ed]">
        <div className="container-main flex min-h-[76px] items-center justify-between">
          <Link href="/" className="font-serif text-3xl tracking-[0.17em]">
            AURELIS
          </Link>

          <div className="flex items-center gap-2 font-mono text-[9px] tracking-[0.16em] text-[#80645b]">
            <LockKeyhole size={13} />
            SECURE CHECKOUT
          </div>
        </div>
      </header>

      {/* INTRO */}
      <section className="bg-[#350817] px-5 py-12 text-[#f1e8d8] sm:py-16">
        <div className="container-main">
          <Link
            href="/shop"
            className="mb-8 inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] text-[#d2bea5] transition hover:text-white"
          >
            <ArrowLeft size={14} />
            CONTINUE SHOPPING
          </Link>

          <p className="mb-3 font-mono text-[10px] tracking-[0.25em] text-[#d2bea5]">
            THE FINAL STEP
          </p>

          <h1 className="font-serif text-5xl leading-none sm:text-7xl">
            Your order,
            <br />
            <span className="italic text-[#d2bea5]">
              beautifully considered.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-7 text-[#f1e8d8]/70">
            A few details, and your chosen pieces will be one step closer to
            you.
          </p>
        </div>
      </section>

      {/* CHECKOUT CONTENT */}
      <section className="container-main py-12 sm:py-16">
        {items.length === 0 ? (
          <div className="mx-auto max-w-xl py-16 text-center">
            <ShoppingBag
              size={34}
              strokeWidth={1}
              className="mx-auto mb-6 text-[#80645b]"
            />

            <h2 className="font-serif text-4xl">Your bag is empty.</h2>

            <p className="mt-4 text-sm leading-7 text-[#80645b]">
              There is nothing here to check out just yet. Discover something
              worth bringing home.
            </p>

            <Link
              href="/shop"
              className="mt-8 inline-flex items-center gap-3 bg-[#470d20] px-8 py-4 font-mono text-[10px] tracking-[0.15em] text-[#f1e8d8] transition hover:bg-[#64152f]"
            >
              EXPLORE THE SHOP
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="grid items-start gap-12 lg:grid-cols-[1.4fr_0.8fr]"
          >
            {/* LEFT COLUMN */}
            <div className="space-y-12">
              {/* CUSTOMER DETAILS */}
              <section>
                <div className="mb-7 flex items-center gap-4">
                  <span className="font-mono text-xs text-[#b9a58a]">01</span>
                  <div>
                    <h2 className="font-serif text-3xl">Your details</h2>
                    <p className="mt-1 text-xs text-[#80645b]">
                      Who should we deliver your order to?
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block font-mono text-[10px] tracking-wider">
                      FULL NAME *
                    </label>
                    <input
                      name="fullName"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Your full name"
                      className="w-full border border-[#470d20]/20 bg-white/60 px-4 py-4 text-sm outline-none transition placeholder:text-[#80645b]/60 focus:border-[#470d20]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-mono text-[10px] tracking-wider">
                      PHONE NUMBER *
                    </label>
                    <input
                      name="phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      placeholder="01XXXXXXXXX"
                      pattern="01[0-9]{9}"
                      title="Enter a valid 11-digit Bangladesh mobile number starting with 01."
                      className="w-full border border-[#470d20]/20 bg-white/60 px-4 py-4 text-sm outline-none transition placeholder:text-[#80645b]/60 focus:border-[#470d20]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block font-mono text-[10px] tracking-wider">
                      EMAIL ADDRESS{" "}
                      <span className="text-[#80645b]">(OPTIONAL)</span>
                    </label>
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="w-full border border-[#470d20]/20 bg-white/60 px-4 py-4 text-sm outline-none transition placeholder:text-[#80645b]/60 focus:border-[#470d20]"
                    />
                  </div>
                </div>
              </section>

              <div className="border-t border-[#470d20]/15" />

              {/* DELIVERY ADDRESS */}
              <section>
                <div className="mb-7 flex items-center gap-4">
                  <span className="font-mono text-xs text-[#b9a58a]">02</span>
                  <div>
                    <h2 className="font-serif text-3xl">Delivery address</h2>
                    <p className="mt-1 text-xs text-[#80645b]">
                      Where should your order arrive?
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="district"
                      className="mb-2 block font-mono text-[10px] tracking-wider"
                    >
                      DISTRICT *
                    </label>

                    <select
                      id="district"
                      name="districtId"
                      required
                      autoComplete="address-level1"
                      value={selectedDistrictId}
                      onChange={(event) => {
                        setSelectedDistrictId(event.target.value);
                        setSelectedPoliceStationId("");
                        setSubmitted(false);
                      }}
                      className="w-full border border-[#470d20]/20 bg-white/60 px-4 py-4 text-sm outline-none transition focus:border-[#470d20]"
                    >
                      <option value="">Select your district</option>

                      {bangladeshDivisions.map((division) => {
                        const divisionDistricts = steadfastDistricts
                          .filter((district) =>
                            bangladeshDivisions
                              .find((item) => item.name === division.name)
                              ?.districts.includes(
                                getPublicDistrictName(district.name),
                              ),
                          )
                          .sort((a, b) => a.name.localeCompare(b.name));

                        return (
                          <optgroup key={division.name} label={division.name}>
                            {divisionDistricts.map((district) => (
                              <option key={district.id} value={district.id}>
                                {district.name === "Dhaka City"
                                  ? "Dhaka — City"
                                  : district.name === "Dhaka Sub-Urban"
                                    ? "Dhaka — Sub-Urban"
                                    : getPublicDistrictName(district.name)}
                              </option>
                            ))}
                          </optgroup>
                        );
                      })}
                    </select>

                    {selectedDistrict && (
                      <p className="mt-2 text-xs text-[#80645b]">
                        {selectedDistrict.name} · {selectedDivision} Division
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="policeStation"
                      className="mb-2 block font-mono text-[10px] tracking-wider"
                    >
                      AREA / THANA *
                    </label>
                    <select
                      id="policeStation"
                      name="policeStationId"
                      required
                      disabled={!selectedDistrict}
                      value={selectedPoliceStationId}
                      onChange={(event) => {
                        setSelectedPoliceStationId(event.target.value);
                        setSubmitted(false);
                      }}
                      className="w-full border border-[#470d20]/20 bg-white/60 px-4 py-4 text-sm outline-none transition focus:border-[#470d20] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="">
                        {selectedDistrict
                          ? "Select your area / thana"
                          : "Select district first"}
                      </option>
                      {selectedPoliceStations.map((station) => (
                        <option key={station.id} value={station.id}>
                          {station.name}
                        </option>
                      ))}
                    </select>
                    {selectedPoliceStation && (
                      <p className="mt-2 text-xs text-[#80645b]">
                        Steadfast destination ID: {selectedPoliceStation.id}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block font-mono text-[10px] tracking-wider">
                      FULL STREET ADDRESS *
                    </label>
                    <textarea
                      name="address"
                      required
                      rows={3}
                      autoComplete="street-address"
                      placeholder="House, road, building, apartment and other details..."
                      className="w-full resize-y border border-[#470d20]/20 bg-white/60 px-4 py-4 text-sm outline-none transition placeholder:text-[#80645b]/60 focus:border-[#470d20]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block font-mono text-[10px] tracking-wider">
                      DELIVERY NOTES{" "}
                      <span className="text-[#80645b]">(OPTIONAL)</span>
                    </label>
                    <textarea
                      name="notes"
                      rows={2}
                      placeholder="Landmark, preferred delivery time, etc."
                      className="w-full resize-y border border-[#470d20]/20 bg-white/60 px-4 py-4 text-sm outline-none transition placeholder:text-[#80645b]/60 focus:border-[#470d20]"
                    />
                  </div>
                </div>
              </section>

              <div className="border-t border-[#470d20]/15" />

              {/* DELIVERY METHOD */}
              <section>
                <div className="mb-7 flex items-center gap-4">
                  <span className="font-mono text-xs text-[#b9a58a]">03</span>
                  <div>
                    <h2 className="font-serif text-3xl">Delivery method</h2>
                    <p className="mt-1 text-xs text-[#80645b]">
                      Choose how you would like to receive your order.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label
                    className={`flex cursor-pointer items-start gap-4 border p-5 transition ${deliveryMethod === "standard" ? "border-[#470d20] bg-white" : "border-[#470d20]/15 bg-white/40"}`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      value="standard"
                      checked={deliveryMethod === "standard"}
                      onChange={() => {
                        setDeliveryMethod("standard");
                        setSubmitted(false);
                      }}
                      className="mt-1 accent-[#470d20]"
                    />
                    <span>
                      <span className="block text-sm font-semibold">
                        Standard delivery
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-[#80645b]">
                        Regular delivery service
                      </span>
                      <span className="mt-3 block font-mono text-[9px] tracking-wider text-[#80645b]">
                        FEE CONFIRMED LATER
                      </span>
                    </span>
                  </label>

                  <label
                    className={`flex cursor-pointer items-start gap-4 border p-5 transition ${deliveryMethod === "express" ? "border-[#470d20] bg-white" : "border-[#470d20]/15 bg-white/40"}`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      value="express"
                      checked={deliveryMethod === "express"}
                      onChange={() => {
                        setDeliveryMethod("express");
                        setSubmitted(false);
                      }}
                      className="mt-1 accent-[#470d20]"
                    />
                    <span>
                      <span className="block text-sm font-semibold">
                        Express delivery
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-[#80645b]">
                        For locations where available
                      </span>
                      <span className="mt-3 block font-mono text-[9px] tracking-wider text-[#80645b]">
                        AVAILABILITY TO BE CONFIRMED
                      </span>
                    </span>
                  </label>
                </div>
              </section>

              <div className="border-t border-[#470d20]/15" />

              {/* PAYMENT METHOD */}
              <section>
                <div className="mb-7 flex items-center gap-4">
                  <span className="font-mono text-xs text-[#b9a58a]">04</span>
                  <div>
                    <h2 className="font-serif text-3xl">Payment method</h2>
                    <p className="mt-1 text-xs text-[#80645b]">
                      Choose your preferred payment option.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      id: "cod",
                      name: "Cash on Delivery",
                      description: "Pay when your order arrives.",
                    },
                    {
                      id: "bkash",
                      name: "bKash",
                      description: "Mobile financial service.",
                    },
                    {
                      id: "nagad",
                      name: "Nagad",
                      description: "Mobile financial service.",
                    },
                    {
                      id: "bank",
                      name: "Bank Transfer",
                      description: "Pay directly through your bank.",
                    },
                  ].map((method) => (
                    <label
                      key={method.id}
                      className={`flex cursor-pointer items-center gap-4 border p-5 transition ${paymentMethod === method.id ? "border-[#470d20] bg-white" : "border-[#470d20]/15 bg-white/40"}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={() => {
                          setPaymentMethod(method.id);
                          setSubmitted(false);
                        }}
                        className="accent-[#470d20]"
                      />
                      <span className="flex-1">
                        <span className="block text-sm font-semibold">
                          {method.name}
                        </span>
                        <span className="mt-1 block text-xs text-[#80645b]">
                          {method.description}
                        </span>
                      </span>
                      {paymentMethod === method.id && (
                        <CheckCircle2 size={18} className="text-[#64152f]" />
                      )}
                    </label>
                  ))}
                </div>
              </section>

              {/* SUBMIT */}
              <div>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-3 bg-[#470d20] px-8 py-5 font-mono text-[10px] tracking-[0.17em] text-[#f1e8d8] transition hover:bg-[#64152f]"
                >
                  REVIEW ORDER DETAILS
                  <ArrowRight size={16} />
                </button>

                {submitted && (
                  <div className="mt-5 border border-[#470d20]/20 bg-white/70 p-5">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <CheckCircle2 size={17} />
                      Details validated
                    </div>
                    <p className="mt-2 text-xs leading-6 text-[#80645b]">
                      Your form passed browser validation. Destination:{" "}
                      {selectedDistrict?.name} / {selectedPoliceStation?.name}{" "}
                      (Steadfast IDs: {selectedDistrict?.id} /{" "}
                      {selectedPoliceStation?.id}). This is still a checkout
                      preview; order placement and payment processing are not
                      connected yet.
                    </p>
                  </div>
                )}

                <p className="mt-4 text-center font-mono text-[9px] tracking-wider text-[#80645b]">
                  <LockKeyhole size={11} className="mr-1 inline" />
                  YOUR DETAILS ARE FOR CHECKOUT ONLY
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN — ORDER SUMMARY */}
            <aside className="border border-[#470d20]/15 bg-[#f1e8d8] p-6 sm:p-8 lg:sticky lg:top-8">
              <p className="mb-3 font-mono text-[9px] tracking-[0.2em] text-[#80645b]">
                YOUR SELECTION
              </p>

              <h2 className="mb-8 font-serif text-3xl">Order summary</h2>

              <div className="space-y-6">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 border-b border-[#470d20]/10 pb-6"
                  >
                    <div
                      className="h-24 w-20 shrink-0 bg-[#e8dece] bg-cover bg-center"
                      style={{
                        backgroundImage: `url("${item.image}")`,
                      }}
                    />

                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="font-serif text-lg leading-tight">
                        {item.name}
                      </p>

                      <p className="mt-2 font-mono text-[10px] text-[#80645b]">
                        {formatPrice(item.price)}
                      </p>

                      <div className="mt-auto flex items-center justify-between pt-3">
                        <div className="flex items-center border border-[#470d20]/20">
                          <button
                            type="button"
                            aria-label={`Decrease ${item.name} quantity`}
                            disabled={item.quantity <= 1}
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="p-2 transition hover:bg-white disabled:opacity-30"
                          >
                            <Minus size={12} />
                          </button>

                          <span className="min-w-7 text-center font-mono text-xs">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            aria-label={`Increase ${item.name} quantity`}
                            disabled={item.quantity >= 10}
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="p-2 transition hover:bg-white disabled:opacity-30"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.name}`}
                          className="p-2 text-[#80645b] transition hover:text-red-800"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#80645b]">Subtotal</span>
                  <span className="font-medium tabular-nums">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-[#80645b]">Delivery fee</span>
                  <span className="text-right text-xs text-[#80645b]">
                    {selectedDistrict
                      ? "Rate pending setup"
                      : "Select district first"}
                  </span>
                </div>

                <div className="border-t border-[#470d20]/20 pt-5">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-xl">Total</span>
                    <span className="font-serif text-2xl tabular-nums">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <p className="mt-2 text-right text-[10px] text-[#80645b]">
                    Delivery fee not included
                  </p>
                </div>
              </div>

              <div className="mt-8 border-t border-[#470d20]/15 pt-6">
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    size={20}
                    strokeWidth={1.4}
                    className="shrink-0 text-[#80645b]"
                  />
                  <p className="text-xs leading-6 text-[#80645b]">
                    Your order details will be reviewed before final
                    confirmation. No payment is collected through this preview.
                  </p>
                </div>
              </div>

              <Link
                href="/shop"
                className="mt-7 flex items-center justify-center gap-2 border border-[#470d20]/25 py-4 font-mono text-[9px] tracking-[0.15em] transition hover:bg-white/60"
              >
                <ArrowLeft size={13} />
                BACK TO SHOP
              </Link>
            </aside>
          </form>
        )}
      </section>

      {/* FOOTER */}
      <footer className="bg-[#350817] px-5 py-8 text-center text-[#f1e8d8]">
        <p className="font-serif text-xl tracking-[0.15em]">AURELIS</p>
        <p className="mt-2 font-mono text-[9px] tracking-[0.15em] text-[#d2bea5]">
          BEYOND ORDINARY, WITHIN REACH.
        </p>
      </footer>
    </main>
  );
}
