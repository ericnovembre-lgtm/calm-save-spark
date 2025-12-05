// Android Balance Widget for $ave+
// This file should be placed in your Android project after running `npx cap add android`
// Requires Glance library for Jetpack Compose widgets

package app.lovable.saveplus

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.*
import androidx.glance.action.actionStartActivity
import androidx.glance.action.clickable
import androidx.glance.appwidget.*
import androidx.glance.appwidget.lazy.LazyColumn
import androidx.glance.layout.*
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import java.text.NumberFormat
import java.util.*

// Widget Data
data class BalanceData(
    val balance: Double = 0.0,
    val currency: String = "USD",
    val lastUpdated: String = "--"
)

// Glance Widget
class BalanceWidget : GlanceAppWidget() {

    override val sizeMode = SizeMode.Exact

    @Composable
    override fun Content() {
        val context = LocalContext.current
        val prefs = context.getSharedPreferences("SavePlusWidget", Context.MODE_PRIVATE)
        
        val data = BalanceData(
            balance = prefs.getFloat("balance", 0f).toDouble(),
            currency = prefs.getString("currency", "USD") ?: "USD",
            lastUpdated = prefs.getString("lastUpdated", "--") ?: "--"
        )

        BalanceWidgetContent(data)
    }
}

@Composable
fun BalanceWidgetContent(data: BalanceData) {
    Box(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(Color(0xFF1a1a2e))
            .cornerRadius(16.dp)
            .clickable(actionStartActivity<MainActivity>())
            .padding(16.dp)
    ) {
        Column(
            modifier = GlanceModifier.fillMaxSize(),
            verticalAlignment = Alignment.Top,
            horizontalAlignment = Alignment.Start
        ) {
            // Header
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "💰",
                    style = TextStyle(fontSize = 16.sp)
                )
                Spacer(modifier = GlanceModifier.width(8.dp))
                Text(
                    text = "Balance",
                    style = TextStyle(
                        color = ColorProvider(Color(0xFF9ca3af)),
                        fontSize = 12.sp
                    )
                )
            }

            Spacer(modifier = GlanceModifier.height(12.dp))

            // Balance amount
            Text(
                text = formatCurrency(data.balance, data.currency),
                style = TextStyle(
                    color = ColorProvider(Color.White),
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold
                )
            )

            Spacer(modifier = GlanceModifier.defaultWeight())

            // Last updated
            Text(
                text = "Updated: ${data.lastUpdated}",
                style = TextStyle(
                    color = ColorProvider(Color(0xFF6b7280)),
                    fontSize = 10.sp
                )
            )
        }
    }
}

private fun formatCurrency(amount: Double, currency: String): String {
    val format = NumberFormat.getCurrencyInstance(Locale.US)
    format.currency = Currency.getInstance(currency)
    return format.format(amount)
}

// Widget Receiver
class BalanceWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = BalanceWidget()
}
