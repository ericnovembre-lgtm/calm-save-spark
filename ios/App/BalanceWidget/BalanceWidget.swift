// iOS Balance Widget for $ave+
// This file should be placed in your Xcode project after running `npx cap add ios`
// Requires WidgetKit and SwiftUI

import WidgetKit
import SwiftUI

// MARK: - Widget Data
struct BalanceEntry: TimelineEntry {
    let date: Date
    let balance: Double
    let currency: String
    let lastUpdated: String
}

// MARK: - Provider
struct BalanceProvider: TimelineProvider {
    // App Group identifier for data sharing
    let appGroupId = "group.app.lovable.saveplus"
    
    func placeholder(in context: Context) -> BalanceEntry {
        BalanceEntry(date: Date(), balance: 0, currency: "USD", lastUpdated: "--")
    }
    
    func getSnapshot(in context: Context, completion: @escaping (BalanceEntry) -> Void) {
        let entry = loadBalanceData()
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<BalanceEntry>) -> Void) {
        let entry = loadBalanceData()
        // Refresh every hour
        let nextUpdate = Calendar.current.date(byAdding: .hour, value: 1, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
    
    private func loadBalanceData() -> BalanceEntry {
        guard let userDefaults = UserDefaults(suiteName: appGroupId) else {
            return placeholder(in: Context())
        }
        
        let balance = userDefaults.double(forKey: "balance")
        let currency = userDefaults.string(forKey: "currency") ?? "USD"
        let lastUpdated = userDefaults.string(forKey: "lastUpdated") ?? "--"
        
        return BalanceEntry(
            date: Date(),
            balance: balance,
            currency: currency,
            lastUpdated: lastUpdated
        )
    }
}

// MARK: - Widget View
struct BalanceWidgetView: View {
    var entry: BalanceEntry
    @Environment(\.widgetFamily) var family
    
    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [Color("WidgetBackground"), Color("WidgetBackgroundSecondary")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
            VStack(alignment: .leading, spacing: 8) {
                // Header
                HStack {
                    Image(systemName: "dollarsign.circle.fill")
                        .foregroundColor(.green)
                    Text("Balance")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                // Balance amount
                Text(formatCurrency(entry.balance, currency: entry.currency))
                    .font(.system(size: family == .systemSmall ? 24 : 32, weight: .bold, design: .rounded))
                    .foregroundColor(.primary)
                    .minimumScaleFactor(0.5)
                    .lineLimit(1)
                
                Spacer()
                
                // Last updated
                Text("Updated: \(entry.lastUpdated)")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            .padding()
        }
    }
    
    private func formatCurrency(_ amount: Double, currency: String) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = currency
        return formatter.string(from: NSNumber(value: amount)) ?? "$0.00"
    }
}

// MARK: - Widget Configuration
@main
struct BalanceWidget: Widget {
    let kind: String = "BalanceWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: BalanceProvider()) { entry in
            BalanceWidgetView(entry: entry)
        }
        .configurationDisplayName("Account Balance")
        .description("View your current balance at a glance")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - Preview
struct BalanceWidget_Previews: PreviewProvider {
    static var previews: some View {
        BalanceWidgetView(entry: BalanceEntry(
            date: Date(),
            balance: 5432.10,
            currency: "USD",
            lastUpdated: "Just now"
        ))
        .previewContext(WidgetPreviewContext(family: .systemSmall))
    }
}
