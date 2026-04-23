import { Header } from "../../../components/header";
import { DetailedBookingForm } from "../../../components/detailed-booking-form";
import { fetchSitterProfile } from "../../../lib/api";

type BookingPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BookingPage({ params, searchParams }: BookingPageProps) {
  const { id } = await params;
  const sitter = await fetchSitterProfile(id).catch(() => null);
  const query = await searchParams;
  const serviceType =
    typeof query.serviceType === "string" ? query.serviceType : sitter?.services[0] ?? "boarding";
  const fromDate = typeof query.fromDate === "string" ? query.fromDate : undefined;
  const toDate = typeof query.toDate === "string" ? query.toDate : undefined;
  const startsAt = typeof query.startsAt === "string" ? query.startsAt : undefined;

  return (
    <main className="page-shell">
      <Header />
      <section className="section-block section-split">
        <div>
          <p className="eyebrow">Confirm your stay</p>
          <h1>Complete your request</h1>
          <p>
            Review the sitter's availability, adjust the dates, and send the request.
          </p>
          {sitter ? <p>{sitter.display_name} · {sitter.address_label || sitter.city}</p> : null}
          <div className="story-card">
            <h2>Booking details</h2>
            <div className="detail-list">
              <p>
                <strong>Service:</strong> {serviceType}
              </p>
              {serviceType === "boarding" ? (
                <p>
                  <strong>Dates:</strong> {fromDate ?? "Select drop off"} to {toDate ?? "Select pick up"}
                </p>
              ) : (
                <p>
                  <strong>Date and time:</strong> {startsAt ?? "Select time"}
                </p>
              )}
            </div>
          </div>
        </div>
        <DetailedBookingForm
          availabilityByService={sitter?.availability_by_service}
          defaultFromDate={fromDate}
          defaultServiceType={serviceType}
          defaultStartsAt={startsAt}
          defaultToDate={toDate}
          sitterId={Number(id)}
        />
      </section>
    </main>
  );
}
