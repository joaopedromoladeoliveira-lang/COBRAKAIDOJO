import React, { useState } from 'react';
import { ShoppingCart, ShoppingBag, Tag, CreditCard, ChevronRight, X, Sparkles, Check, Shirt, Trophy, AlertCircle } from 'lucide-react';
import { StoreItem } from '../types';

export const DojoStore: React.FC<{
  storeItems: StoreItem[];
  onGainXP: (xp: number) => void;
  triggerSound: (type: 'nav' | 'punch' | 'belt' | 'gong') => void;
}> = ({ storeItems, onGainXP, triggerSound }) => {
  const [cart, setCart] = useState<{ item: StoreItem; size: string; qty: number }[]>([]);
  const [coupons, setCoupons] = useState<string[]>(['COBRAKAI20', 'TEAMSOUSA10']);
  const [activeCoupon, setActiveCoupon] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState('');
  
  // Checkout flow state
  const [checkoutStep, setCheckoutStep] = useState<'shopping' | 'checkout' | 'pix' | 'success'>('shopping');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('pix');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');

  const handleAddToCart = (item: StoreItem, size: string) => {
    triggerSound('punch');
    setCart(prev => {
      const exists = prev.find(i => i.item.id === item.id && i.size === size);
      if (exists) {
        return prev.map(i => i.item.id === item.id && i.size === size ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { item, size, qty: 1 }];
    });
  };

  const handleRemoveFromCart = (itemId: string, size: string) => {
    triggerSound('nav');
    setCart(prev => prev.filter(i => !(i.item.id === itemId && i.size === size)));
  };

  const applyCoupon = () => {
    triggerSound('nav');
    const cleaned = couponInput.trim().toUpperCase();
    if (coupons.includes(cleaned)) {
      setActiveCoupon(cleaned);
      setCouponInput('');
    } else {
      alert('Cupom do dojo inválido!');
    }
  };

  const cartSubtotal = cart.reduce((acc, current) => acc + (current.item.price * current.qty), 0);
  const discountMultiplier = activeCoupon === 'COBRAKAI20' ? 0.2 : activeCoupon === 'TEAMSOUSA10' ? 0.1 : 0;
  const discountVal = cartSubtotal * discountMultiplier;
  const cartTotal = cartSubtotal - discountVal;

  const handleFinalizeCheckout = () => {
    triggerSound('gong');
    if (paymentMethod === 'pix') {
      setCheckoutStep('pix');
    } else {
      setCheckoutStep('success');
      onGainXP(100); // 100 XP as a shopping support reward (Dojo support!)
    }
  };

  const completePixPayment = () => {
    triggerSound('gong');
    setCheckoutStep('success');
    onGainXP(100);
    setCart([]);
  };

  return (
    <div className="space-y-8">
      
      {/* Visual store header */}
      <div className="bg-gradient-to-r from-red-950 via-neutral-900 to-black p-6 rounded-xl border border-red-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-yellow-500 uppercase">
            <Shirt className="w-4 h-4" /> Armaria Oficial do Dojo
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Kimonos &amp; Suprimentos Profissionais</h2>
          <p className="text-xs text-neutral-400 font-sans">Adquira os mantos oficiais da academia Team Paulo Souza e Cobra Kai. Cada compra apoia a manutenção do dojo virtual.</p>
        </div>

        {/* Coupons hint */}
        <div className="bg-black/80 border border-neutral-800 p-3 rounded-lg flex items-center gap-2">
          <Tag className="w-4 h-4 text-yellow-400" />
          <div className="text-[10px] font-mono leading-tight">
            <span className="text-white block font-bold">Cupons de desconto dink:</span>
            <span className="text-red-500 font-bold">COBRAKAI20 (-20%) • TEAMSOUSA10 (-10%)</span>
          </div>
        </div>
      </div>

      {checkoutStep === 'shopping' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Products List Grid */}
          <div className="lg:col-span-2">
            {storeItems.length === 0 ? (
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center text-neutral-300 font-mono w-full">
                <ShoppingBag className="w-12 h-12 text-rose-500 mx-auto mb-4 animate-pulse" />
                <h3 className="text-base font-bold text-white uppercase tracking-wider font-sans">Armaria do Dojo</h3>
                <p className="text-xs text-neutral-400 mt-2">Nenhum conteúdo disponível ainda</p>
                <p className="text-[10px] text-neutral-500 mt-2 max-w-sm mx-auto font-sans leading-relaxed">
                  Não há kimonos ou acessórios cadastrados na vitrine neste momento pelo mestre do dojo.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {storeItems.map(item => (
                  <div key={item.id} className="bg-neutral-900 border border-neutral-800/80 rounded-xl overflow-hidden flex flex-col justify-between group">
                    <div className="relative aspect-square max-h-[220px] overflow-hidden bg-black p-4 flex items-center justify-center">
                      <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500" />
                      
                      {item.originalPrice && (
                        <div className="absolute top-2 left-2 bg-red-600 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded shadow">
                          OFERTA
                        </div>
                      )}
                      
                      <div className="absolute top-2 right-2 bg-black/80 border border-neutral-850 px-2 py-0.5 rounded text-[9px] text-yellow-400 font-mono">
                        ★ {item.rating}
                      </div>
                    </div>

                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-left">
                      <div className="space-y-1">
                        <span className="block text-[9px] text-red-500 font-mono font-bold uppercase">{item.category}</span>
                        <h3 className="text-xs font-bold text-white font-sans leading-snug line-clamp-2">{item.name}</h3>
                      </div>

                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-sm font-black text-yellow-400 font-mono">R$ {item.price},00</span>
                        {item.originalPrice && (
                          <span className="text-xs text-neutral-500 line-through font-mono">R$ {item.originalPrice},00</span>
                        )}
                      </div>

                      {/* Sizes selector grid */}
                      <div className="space-y-2">
                        <span className="block text-[9px] text-neutral-400 font-mono">Selecione o tamanho:</span>
                        <div className="flex flex-wrap gap-1">
                          {item.sizes.map(sz => (
                            <button 
                              key={sz}
                              onClick={() => handleAddToCart(item, sz)}
                              className="bg-neutral-950 hover:bg-red-950 hover:border-red-600 border border-neutral-800 rounded px-2.5 py-1 text-[9px] text-neutral-300 font-mono transition-all"
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkout Shopping Cart column */}
          <div className="space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-5">
              <h3 className="text-sm font-black font-mono text-white uppercase flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-red-500" /> Seu Carrinho ({cart.reduce((a, b) => a + b.qty, 0)})
              </h3>

              <div className="space-y-4 max-h-[290px] overflow-y-auto pr-2">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 font-mono text-xs">
                    * Seu carrinho está vazio. Adicione kimonos e faixas para dominar o tatame!
                  </div>
                ) : (
                  cart.map(i => (
                    <div key={`${i.item.id}-${i.size}`} className="flex gap-2 text-left bg-neutral-950 p-2.5 rounded border border-neutral-800/60 items-start justify-between">
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate max-w-[120px]">{i.item.name}</h4>
                        <div className="flex items-center gap-2 text-[9px] text-neutral-400 font-mono mt-0.5">
                          <span>Tam: {i.size}</span>
                          <span>•</span>
                          <span>Qtd: {i.qty}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-yellow-400">R$ {i.item.price * i.qty}</span>
                        <button 
                          onClick={() => handleRemoveFromCart(i.item.id, i.size)}
                          className="text-neutral-500 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-neutral-800 pt-4 space-y-3.5">
                  {/* Coupon section */}
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Cupom doji..."
                      className="flex-1 bg-black border border-neutral-800 text-xs rounded px-2.5 py-1.5 text-white outline-none"
                    />
                    <button 
                      onClick={applyCoupon}
                      className="bg-neutral-800 hover:bg-neutral-700 text-xs uppercase px-3 rounded font-mono text-neutral-300"
                    >
                      Ok
                    </button>
                  </div>

                  {activeCoupon && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-1.5 flex items-center justify-between text-[10px] font-mono text-yellow-400">
                      <span>✓ Cupom {activeCoupon} Ativado</span>
                      <button onClick={() => { setActiveCoupon(null); triggerSound('nav'); }} className="underline hover:text-red-500">Remover</button>
                    </div>
                  )}

                  {/* Pricing math summaries */}
                  <div className="space-y-1.5 font-mono text-xs text-neutral-400">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="text-white">R$ {cartSubtotal},00</span>
                    </div>
                    {discountVal > 0 && (
                      <div className="flex justify-between text-red-400">
                        <span>Desconto Cupom:</span>
                        <span>- R$ {discountVal},00</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-neutral-800 pt-2 font-black text-sm text-yellow-400">
                      <span>Total Geral:</span>
                      <span>R$ {cartTotal},00</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => { setCheckoutStep('checkout'); triggerSound('gong'); }}
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-black uppercase text-xs py-3 rounded-lg flex items-center justify-center gap-1 font-mono tracking-widest shadow shadow-red-950"
                  >
                    Seguir para Checkout <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Payment details step */}
      {checkoutStep === 'checkout' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-xl mx-auto text-left space-y-6">
          <div className="border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-black font-mono text-white uppercase">Checkout do Tatame</h3>
            <p className="text-[11px] text-neutral-400 font-sans">Escolha seu método de pagamento e informe os dados para a nota.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 font-mono text-xs">
            <button 
              onClick={() => { setPaymentMethod('pix'); triggerSound('nav'); }}
              className={`p-3 border rounded-lg text-center flex items-center justify-center gap-1.5 ${
                paymentMethod === 'pix' ? 'bg-red-900/10 border-red-500 text-white font-bold' : 'bg-neutral-950 border-neutral-800 text-neutral-400'
              }`}
            >
              ⚡ PIX Automático
            </button>
            <button 
              onClick={() => { setPaymentMethod('card'); triggerSound('nav'); }}
              className={`p-3 border rounded-lg text-center flex items-center justify-center gap-1.5 ${
                paymentMethod === 'card' ? 'bg-red-900/10 border-red-500 text-white font-bold' : 'bg-neutral-950 border-neutral-800 text-neutral-400'
              }`}
            >
              <CreditCard className="w-4 h-4" /> Cartão de Crédito
            </button>
          </div>

          {paymentMethod === 'card' ? (
            <div className="space-y-3 font-mono text-xs text-neutral-300">
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400">Número do Cartão</label>
                <input 
                  type="text" 
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4444 5555 6666 7777" 
                  className="w-full bg-black border border-neutral-800 rounded p-2 text-white" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400">Titular</label>
                  <input 
                    type="text" 
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="JOAO P M OLIVEIRA" 
                    className="w-full bg-black border border-neutral-800 rounded p-2 text-white" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400">CVV</label>
                  <input 
                    type="text" 
                    placeholder="912" 
                    className="w-full bg-black border border-neutral-800 rounded p-2 text-white" 
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-lg text-xs leading-relaxed font-sans text-neutral-400 space-y-2">
              <p className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-yellow-500 animate-bounce" /> Pagamento Facilitado no PIX
              </p>
              <p>Optando por PIX, o sistema gera o QRCode e cópia-e-cola imediato. Suas mercadorias e seu bônus de <span className="text-yellow-400 font-bold">+100 XP</span> dojo serão liberados assim que efetuar o clique!</p>
            </div>
          )}

          <div className="flex items-center justify-between font-mono text-sm pt-4 border-t border-neutral-800 text-white">
            <span>Total da Compra:</span>
            <span className="text-yellow-400 font-bold">R$ {cartTotal},00</span>
          </div>

          <div className="flex gap-2 font-mono text-xs">
            <button 
              onClick={() => { setCheckoutStep('shopping'); triggerSound('nav'); }}
              className="flex-1 bg-neutral-950 border border-neutral-800 text-neutral-300 p-3 rounded-lg hover:bg-neutral-800 text-center"
            >
              Voltar
            </button>
            <button 
              onClick={handleFinalizeCheckout}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold p-3 rounded-lg text-center"
            >
              Confirmar e Pagar
            </button>
          </div>
        </div>
      )}

      {/* PIX visual barcode simulation step */}
      {checkoutStep === 'pix' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-sm mx-auto text-center space-y-6">
          <h3 className="text-sm font-black font-mono text-white uppercase tracking-wider">QR Code PIX Gerado</h3>
          
          <div className="w-40 h-40 bg-white p-2 rounded-lg mx-auto flex items-center justify-center shadow-lg border border-red-500">
            {/* Draw dummy QR Code with SVG */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path d="M0,0 h30 v10 h-20 v20 h-10 Z M70,0 h30 v30 h-10 v-20 h-20 Z M0,70 h10 v20 h20 v10 h-30 Z M70,100 h30 v-30 h-10 v-20 M30,30 h40 v40 h-40 Z" fill="#000" />
              <rect x="40" y="40" width="20" height="20" fill="#b91c1c" />
              <rect x="15" y="15" width="10" height="10" fill="#000" />
              <rect x="75" y="15" width="10" height="10" fill="#000" />
              <rect x="15" y="75" width="10" height="10" fill="#000" />
            </svg>
          </div>

          <div className="space-y-2 font-mono text-xs text-neutral-300">
            <p className="text-yellow-500 font-bold">Chave Aleatória de Pagamento (Cópia-e-Cola):</p>
            <div className="bg-black border border-neutral-800 p-2.5 rounded text-[10px] truncate">
              00020126580014br.gov.pix0136joaopedromoladeoliveira@gmail.com5538054cai
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-800/60 flex gap-2">
            <button 
              onClick={() => { setCheckoutStep('checkout'); triggerSound('nav'); }}
              className="flex-1 bg-neutral-950 border border-neutral-800 text-neutral-400 p-2.5 rounded font-mono text-xs"
            >
              Cancelar
            </button>
            <button 
              onClick={completePixPayment}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold p-2.5 rounded font-mono text-xs uppercase"
            >
              Simular Pago
            </button>
          </div>
        </div>
      )}

      {/* Success Receipt view */}
      {checkoutStep === 'success' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 max-w-md mx-auto text-center space-y-6">
          <div className="w-16 h-16 bg-green-500/10 border border-green-500/40 text-green-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-950/20">
            <Check className="w-8 h-8 mx-auto" strokeWidth={3} />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-black font-mono text-white uppercase tracking-tight">PEDIDO FINALIZADO</h3>
            <p className="text-xs text-neutral-400 font-sans leading-relaxed">
              Obrigado por apoiar a academia Team Paulo Souza &amp; Cobra Kai! Suas mercadorias estão reservadas e o código de rastreamento enviado por email.
            </p>
          </div>

          <div className="bg-neutral-950 p-4 border border-neutral-800 rounded-lg text-left font-mono text-[11px] text-neutral-300 space-y-1.5">
            <div className="flex justify-between font-bold text-yellow-500 border-b border-neutral-800 pb-1.5 mb-1.5">
              <span>Nº Transação:</span>
              <span>#SOUZA-2025-912</span>
            </div>
            <div>• Desconto Cupom: Ativo</div>
            <div>• Recompensa Integral: <span className="text-green-500">+100 XP Creditados</span></div>
            <div>• Nota fiscal de suporte dink cadastrada.</div>
          </div>

          <button 
            onClick={() => { setCheckoutStep('shopping'); triggerSound('nav'); }}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-black uppercase text-xs py-3 rounded-lg font-mono tracking-widest shadow"
          >
            Voltar para Armaria
          </button>
        </div>
      )}

    </div>
  );
};
