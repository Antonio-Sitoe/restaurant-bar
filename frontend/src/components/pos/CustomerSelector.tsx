import { useState } from 'react'
import { useCustomers } from '@/hooks/useCustomers'
import { Customer } from '@/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { User, X } from 'lucide-react'

interface CustomerSelectorProps {
  selectedCustomer: Customer | null
  onSelect: (customer: Customer | null) => void
}

export function CustomerSelector({
  selectedCustomer,
  onSelect,
}: CustomerSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const { data: customers } = useCustomers({ query: searchQuery })

  return (
    <div className="space-y-2">
      {selectedCustomer ? (
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="font-medium text-sm">{selectedCustomer.name}</p>
                  {selectedCustomer.phone && (
                    <p className="text-xs text-gray-500">
                      {selectedCustomer.phone}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onSelect(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <Input
            placeholder="Buscar cliente (opcional)..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            className="w-full"
          />
          {searchQuery && customers && customers.length > 0 && (
            <Card className="max-h-48 overflow-y-auto">
              <CardContent className="p-2">
                <div className="space-y-1">
                  {customers.slice(0, 5).map((customer: Customer) => (
                    <button
                      key={customer.id}
                      onClick={() => {
                        onSelect(customer)
                        setSearchQuery('')
                      }}
                      className="w-full text-left p-2 hover:bg-gray-100 rounded text-sm flex items-center gap-2"
                    >
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        {customer.phone && (
                          <p className="text-xs text-gray-500">
                            {customer.phone}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
