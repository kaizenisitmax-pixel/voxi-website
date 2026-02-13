import { MessageCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const chats = [
  {
    id: "1",
    name: "Salon Projesi",
    lastMessage: "Tasarım tamamlandı, inceleyebilirsiniz.",
    time: "14:32",
    unread: 2,
  },
  {
    id: "2",
    name: "Mutfak Yenileme",
    lastMessage: "Renk paletini güncelledim.",
    time: "Dün",
    unread: 0,
  },
  {
    id: "3",
    name: "Yatak Odası Dekorasyon",
    lastMessage: "Perde seçeneklerini gönderiyorum.",
    time: "Pzt",
    unread: 0,
  },
];

export default function SohbetlerPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:py-8">
      {/* Başlık */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Sohbetler</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Tasarım projelerindeki mesajların
        </p>
      </div>

      {/* Arama */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
        <Input
          placeholder="Sohbet ara..."
          className="h-11 rounded-xl border-border-light bg-white pl-10 text-sm text-text-primary placeholder:text-text-tertiary focus-visible:ring-accent-black"
        />
      </div>

      {/* Sohbet Listesi */}
      {chats.length > 0 ? (
        <div className="space-y-2">
          {chats.map((chat) => (
            <button
              key={chat.id}
              className="flex w-full items-center gap-4 rounded-2xl border border-border-light bg-white p-4 text-left transition-shadow hover:shadow-sm btn-press"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-warm-bg">
                <MessageCircle className="h-5 w-5 text-text-tertiary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="truncate text-sm font-semibold text-text-primary">
                    {chat.name}
                  </h3>
                  <span className="shrink-0 text-[10px] text-text-tertiary">
                    {chat.time}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center justify-between">
                  <p className="truncate text-xs text-text-secondary">
                    {chat.lastMessage}
                  </p>
                  {chat.unread > 0 && (
                    <span className="ml-2 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-accent-black px-1.5 text-[10px] font-medium text-white">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-border-light bg-white">
            <MessageCircle className="h-8 w-8 text-text-tertiary" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary">
            Henüz sohbet yok
          </h3>
          <p className="mt-1 text-center text-sm text-text-secondary">
            Tasarım projelerinde mesajlaşma<br />burada görünecek.
          </p>
        </div>
      )}
    </div>
  );
}
