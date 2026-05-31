export const dashboardStyles = {
  dashboard: 'min-h-screen px-4 pb-10 text-white sm:px-6 lg:px-8',
  header: 'flex min-h-16 items-center justify-end gap-2 pt-4',
  hero: 'mx-auto flex w-full max-w-3xl flex-col items-center pt-6 pb-6 text-center sm:pt-8',
  content: 'mx-auto w-full max-w-[880px]',
  settingsButton:
    'inline-flex size-10 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 [&_svg]:size-5',
  addFavoriteCard:
    'add-favorite-card group relative flex w-full flex-col items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-center text-white shadow-lg shadow-black/10 backdrop-blur-xl ring-1 ring-white/10 transition duration-200 hover:-translate-y-1 hover:border-white/25 hover:bg-white/15 hover:shadow-2xl hover:shadow-violet-950/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300',
  addFavoriteIcon:
    'grid shrink-0 place-items-center rounded-xl bg-white/15 text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] transition group-hover:bg-white/20 group-hover:text-white [&_svg]:size-7',
  addFavoriteIconComfortable: 'size-10 sm:size-10',
  addFavoriteIconCompact: 'size-8 sm:size-8 [&_svg]:size-5',
  addFavoriteTitle: 'max-w-full truncate font-semibold leading-tight text-white',
  launcherGrid:
    'mx-auto grid w-full justify-center gap-3 [grid-template-columns:repeat(3,minmax(0,92px))] sm:gap-4 sm:[grid-template-columns:repeat(5,minmax(0,104px))] lg:[grid-template-columns:repeat(7,minmax(0,112px))] xl:[grid-template-columns:repeat(7,minmax(0,118px))]',
  launcherGridCompact:
    'mx-auto grid w-full justify-center gap-2 [grid-template-columns:repeat(3,minmax(0,78px))] sm:gap-3 sm:[grid-template-columns:repeat(5,minmax(0,88px))] lg:[grid-template-columns:repeat(7,minmax(0,96px))] xl:[grid-template-columns:repeat(7,minmax(0,104px))]',
  folderGrid:
    'mx-auto grid w-full justify-center gap-3 [grid-template-columns:repeat(2,minmax(0,128px))] sm:gap-5 sm:[grid-template-columns:repeat(4,minmax(0,142px))]',
  folderHeader: 'mb-4 flex px-10 items-center justify-between',
  backButton:
    'inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/75 shadow-lg backdrop-blur-xl transition hover:bg-white/15 hover:text-white',
  folderTitle: 'truncate text-sm font-semibold text-white/70',
  viewSwitch:
    'mx-auto mb-4 flex w-max rounded-full border border-white/10 bg-white/10 p-1 shadow-lg backdrop-blur',
  viewButton:
    'min-w-24 rounded-full px-4 py-2 text-sm font-semibold text-white/65 transition hover:text-white',
  viewButtonActive: 'bg-violet-500/25 text-white shadow-sm',
} as const;
