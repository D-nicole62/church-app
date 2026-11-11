type EventImageFieldProps = {
  currentUrl?: string | null;
};

export function EventImageField({ currentUrl }: EventImageFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-foreground/80">Image</label>
      {currentUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={currentUrl}
          alt=""
          className="h-32 w-full max-w-sm rounded-xl object-cover"
        />
      ) : null}
      <input
        type="file"
        name="image"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="block w-full text-sm text-foreground file:mr-3 file:rounded-full file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-xs file:font-medium"
      />
      {currentUrl ? (
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" name="removeImage" />
          Remove current image
        </label>
      ) : null}
      <p className="text-[11px] text-muted-foreground">
        Optional. JPG, PNG, WEBP, or GIF up to 2 MB. Shown on the public events page.
      </p>
    </div>
  );
}