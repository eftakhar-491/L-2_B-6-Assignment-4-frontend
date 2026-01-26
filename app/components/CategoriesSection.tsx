'use client'

import Link from 'next/link'
import { categories } from '@/app/lib/mockData'
import { motion } from 'framer-motion'

export function CategoriesSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Popular Cuisines
          </motion.h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Explore meals from your favorite cuisines
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5 }}
            >
              <Link
                href={`/meals?category=${category.name}`}
                className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-secondary transition-all duration-300 group"
              >
                <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <span className="text-sm font-medium text-center">{category.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
