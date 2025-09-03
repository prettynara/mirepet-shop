import React from 'react'
import { assets } from '../assets/assets'

const policies = [
  {
    icon: assets.exchange_icon,
    title: "Easy Exchange Policy",
    desc: "Hassle-free exchange policy."
  },
  {
    icon: assets.check_icon,
    title: "10 Days Return Policy",
    desc: "We provide 10 days free return policy."
  },
  {
    icon: assets.support_icon,
    title: "Customer Support",
    desc: "We provide 8/7 customer support."
  }
]

const OurPolicy = () => {
  return (
    <div className="py-12 px-6 bg-gray-50 mt-32">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {policies.map((policy, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center bg-white rounded-2xl shadow-sm p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-md"
          >
            <img
              src={policy.icon}
              alt={policy.title}
              className="w-14 h-14 mb-4"
            />
            <h3 className="font-semibold text-base text-gray-800">
              {policy.title}
            </h3>
            <p className="text-gray-500 mt-1 text-sm">{policy.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OurPolicy
