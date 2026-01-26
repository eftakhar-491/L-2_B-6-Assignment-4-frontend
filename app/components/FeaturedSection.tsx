'use client'

import { meals } from '@/app/lib/mockData'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

export function FeaturedSection() {
  const featured = meals.slice(0, 6)

  return (
    <section className="py-16 md:py-24 bg-secondary/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Featured Meals
          </motion.h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Check out our most popular dishes right now
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((meal, index) => (
            <motion.div
              key={meal.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group h-full"
            >
              <Link href={`/meals/${meal.id}`}>
                <div className="overflow-hidden rounded-xl bg-card shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                  <div className="relative overflow-hidden h-48 bg-muted">
                    <img
                      src={meal.image || "/placeholder.svg"}
                      alt={meal.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                      ${meal.price}
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                      {meal.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 flex-1">
                      {meal.description}
                    </p>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="font-semibold">{meal.rating}</span>
                        <span className="text-muted-foreground">({meal.reviews})</span>
                      </div>
                      <span className="text-muted-foreground">{meal.preparationTime}m</span>
                    </div>

                    {meal.dietary && (
                      <div className="mt-3 flex gap-2 flex-wrap">
                        {meal.dietary.map(tag => (
                          <span
                            key={tag}
                            className="text-xs bg-secondary text-foreground px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link
            href="/meals"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors duration-300"
          >
            View All Meals →
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
